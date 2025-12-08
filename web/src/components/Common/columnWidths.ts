// Source of truth for all column widths across all data grids
// All get*Columns.tsx files must use constants from this file, never define widths directly

export const columnWidths = {
  // Situation Report columns
  'situation_report.metric': 146,
  'situation_report.value': 80,
  'situation_report.projected': 150,

  // Assets columns
  'assets.name': 160,
  'assets.value': 100,
  'assets.projected': 120,

  // Capabilities columns
  'capabilities.name': 180,
  'capabilities.value': 100,
  'capabilities.upgrade': 100,
  'capabilities.price': 100,

  // Missions columns
  'missions.id': 240,
  'missions.state': 120,
  'missions.expires_in': 90,
  'missions.enemies': 80,
  'missions.avg_skill': 80,
  'missions.details': 100,

  // Leads columns
  'leads.id': 300,
  'leads.difficulty': 120,
  'leads.repeatable': 120,
  'leads.investigations': 140,

  // Lead Investigations columns
  'lead_investigations.lead_investigation_title': 200,
  'lead_investigations.agents': 80,
  'lead_investigations.intel': 64,
  'lead_investigations.success_chance': 80,
  'lead_investigations.intel_decay': 80,
  'lead_investigations.projected_intel': 120,

  // Agents columns
  'agents.id': 120,
  'agents.state': 140,
  'agents.assignment': 140,
  'agents.skill': 140,
  'agents.hit_points': 80,
  'agents.recovery': 90,
  'agents.exhaustion': 110,
  'agents.skill_simple': 70,
  'agents.hit_points_max': 50,
  'agents.service': 120,
  'agents.missions_total': 80,
  'agents.mission': 180,
  'agents.by': 170,

  // Mission Site Details columns
  'mission_site_details.key': 160,
  'mission_site_details.value': 240,

  // Battle Log columns
  'battle_log.round_number': 50,
  'battle_log.status': 100,
  'battle_log.agent_count': 70,
  'battle_log.agent_skill': 150,
  'battle_log.agent_hp': 140,
  'battle_log.enemy_count': 70,
  'battle_log.enemy_skill': 150,
  'battle_log.enemy_hp': 140,
  'battle_log.skill_ratio': 70,

  // Combat Log columns
  'combat_log.attack_id': 50,
  'combat_log.round_number': 50,
  'combat_log.agent_id': 100,
  'combat_log.enemy_id': 170,
  'combat_log.attacker_type': 80,
  'combat_log.outcome': 90,
  'combat_log.attacker_skill': 150,
  'combat_log.defender_skill': 150,
  'combat_log.roll': 90,
  'combat_log.threshold': 110,
  'combat_log.damage': 180,
  'combat_log.defender_hp': 130,
} as const
