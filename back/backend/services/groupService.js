import db from '../config/database.js';
import { NotificationService } from './notificationService.js';

/**
 * Servicio de grupos colaborativos
 */
export class GroupService {
  /**
   * Obtiene todos los grupos de un usuario
   */
  static async getByUserId(userId) {
    return db('groups')
      .join('group_members', 'groups.id', 'group_members.group_id')
      .where('group_members.user_id', userId)
      .select('groups.*', 'group_members.role')
      .orderBy('groups.created_at', 'desc');
  }

  /**
   * Obtiene un grupo por ID con sus miembros
   */
  static async getById(id, userId) {
    // Verificar que el usuario es miembro del grupo
    const member = await db('group_members')
      .where({ group_id: id, user_id: userId })
      .first();

    if (!member) {
      throw new Error('No tienes acceso a este grupo');
    }

    const group = await db('groups').where({ id }).first();
    if (!group) {
      throw new Error('Grupo no encontrado');
    }

    // Obtener miembros
    const members = await db('group_members')
      .where({ group_id: id })
      .join('users', 'group_members.user_id', 'users.id')
      .select(
        'group_members.id',
        'group_members.role',
        'users.id as user_id',
        'users.name',
        'users.email'
      );

    // Obtener estadísticas agregadas del grupo
    const transactions = await db('transactions')
  .where({owner_type: 'group', owner_id: id}) // ✔ CORREGIDO
  .join('categories', 'transactions.category_id', 'categories.id')
  .select(
    'transactions.*',
    'categories.name as category_name',
    'transactions.user_id'
  )
  .orderBy('transactions.date', 'desc');

    return {
      ...group,
      members,
      transactions,
      userRole: member.role,
    };
  }

  /**
   * Crea un nuevo grupo
   */
  static async create(userId, data) {
    const [group] = await db('groups')
      .insert({
        creator_id: userId,
        name: data.name,
        description: data.description || null,
        target_amount: data.target_amount || null,
      })
      .returning('*');

    // Agregar creador como admin
    await db('group_members').insert({
      group_id: group.id,
      user_id: userId,
      role: 'admin',
    });

    return this.getById(group.id, userId);
  }

  /**
   * Invita un usuario a un grupo
   */
  static async invite(groupId, inviterId, inviteeEmail) {
    // Verificar que el inviter es miembro del grupo
    const inviter = await db('group_members')
      .where({ group_id: groupId, user_id: inviterId })
      .first();

    if (!inviter) {
      throw new Error('No eres miembro de este grupo');
    }

    // Buscar usuario por email
    const invitee = await db('users').where({ email: inviteeEmail }).first();
    if (!invitee) {
      throw new Error('Usuario no encontrado');
    }

    // Verificar que no es miembro ya
    const existingMember = await db('group_members')
      .where({ group_id: groupId, user_id: invitee.id })
      .first();

    if (existingMember) {
      throw new Error('El usuario ya es miembro del grupo');
    }

    // Verificar que no hay invitación pendiente
    const existingInvitation = await db('group_invitations')
      .where({
        group_id: groupId,
        invitee_id: invitee.id,
        status: 'pending',
      })
      .first();

    if (existingInvitation) {
      throw new Error('Ya existe una invitación pendiente para este usuario');
    }

    // Crear invitación
    const [invitation] = await db('group_invitations')
      .insert({
        group_id: groupId,
        inviter_id: inviterId,
        invitee_id: invitee.id,
        status: 'pending',
      })
      .returning('*');

    // Crear notificación
    const group = await db('groups').where({ id: groupId }).first();
    const inviterUser = await db('users').where({ id: inviterId }).first();
    await NotificationService.create(invitee.id, {
      type: 'group_invitation',
      title: 'Invitación a grupo',
      message: `${inviter.name} te ha invitado al grupo "${group.name}"`,
      data: { groupId, invitationId: invitation.id },
    });

    return invitation;
  }

  /**
   * Acepta o rechaza una invitación
   */
  static async respondToInvitation(invitationId, userId, accept) {
    const invitation = await db('group_invitations')
      .where({ id: invitationId, invitee_id: userId })
      .first();

    if (!invitation) {
      throw new Error('Invitación no encontrada');
    }

    if (invitation.status !== 'pending') {
      throw new Error('La invitación ya fue procesada');
    }

    const status = accept ? 'accepted' : 'rejected';

    await db('group_invitations')
      .where({ id: invitationId })
      .update({ status });

    if (accept) {
      // Agregar como miembro
      await db('group_members').insert({
        group_id: invitation.group_id,
        user_id: userId,
        role: 'member',
      });
    }

    return { status };
  }

  /**
   * Propone una modificación que requiere aprobación unánime
   */
  static async proposeModification(groupId, proposerId, modificationType, newValue) {
    // Verificar que el proposer es miembro
    const proposer = await db('group_members')
      .where({ group_id: groupId, user_id: proposerId })
      .first();

    if (!proposer) {
      throw new Error('No eres miembro de este grupo');
    }

    // Obtener valor actual
    const group = await db('groups').where({ id: groupId }).first();
    let oldValue = null;
    if (modificationType === 'target_amount') {
      oldValue = group.target_amount;
    } else if (modificationType === 'name') {
      oldValue = group.name;
    } else if (modificationType === 'description') {
      oldValue = group.description;
    }

    // Crear modificación
    const [modification] = await db('group_modifications')
      .insert({
        group_id: groupId,
        proposer_id: proposerId,
        modification_type: modificationType,
        old_value: oldValue,
        new_value: newValue,
        status: 'pending',
      })
      .returning('*');

    // Obtener todos los miembros excepto el proposer
    const members = await db('group_members')
      .where({ group_id: groupId })
      .where('user_id', '!=', proposerId)
      .select('user_id');

    // Crear notificaciones para todos los miembros
    for (const member of members) {
      await NotificationService.create(member.user_id, {
        type: 'modification_proposed',
        title: 'Modificación propuesta',
        message: `Se ha propuesto una modificación en el grupo "${group.name}"`,
        data: { groupId, modificationId: modification.id },
      });
    }

    return modification;
  }

  /**
   * Aprueba o rechaza una modificación
   */
  static async respondToModification(modificationId, userId, approve) {
    const modification = await db('group_modifications')
      .where({ id: modificationId })
      .first();

    if (!modification) {
      throw new Error('Modificación no encontrada');
    }

    if (modification.status !== 'pending') {
      throw new Error('La modificación ya fue procesada');
    }

    // Verificar que el usuario es miembro del grupo
    const member = await db('group_members')
      .where({
        group_id: modification.group_id,
        user_id: userId,
      })
      .first();

    if (!member) {
      throw new Error('No eres miembro de este grupo');
    }

    // Registrar aprobación
    await db('modification_approvals')
      .insert({
        modification_id: modificationId,
        user_id: userId,
        approved: approve,
      })
      .onConflict(['modification_id', 'user_id'])
      .merge();

    // Verificar si todos los miembros han aprobado
    const members = await db('group_members')
      .where({ group_id: modification.group_id })
      .where('user_id', '!=', modification.proposer_id)
      .select('user_id');

    const approvals = await db('modification_approvals')
      .where({ modification_id: modificationId, approved: true })
      .select('user_id');

    // Si todos aprobaron, aplicar modificación
    if (approvals.length === members.length) {
      const updateData = {};
      updateData[modification.modification_type] = modification.new_value;

      await db('groups')
        .where({ id: modification.group_id })
        .update(updateData);

      await db('group_modifications')
        .where({ id: modificationId })
        .update({ status: 'approved' });
    } else if (!approve) {
      // Si alguien rechaza, marcar como rechazada
      await db('group_modifications')
        .where({ id: modificationId })
        .update({ status: 'rejected' });
    }

    return { approved: approve };
  }
}

