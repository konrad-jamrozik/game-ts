// Source of truth for all column widths across all data grids
// All get*Columns.tsx files must use constants from this file, never define widths directly

export const columnWidths = {
  // Situation Report columns
  'situation_report.metric': 120,
  'situation_report.value': 80,
  'situation_report.projected': 150,

  // Assets columns
  'assets.name': 160,
  'assets.value': 100,
  'assets.projected': 120,

  // Capabilities columns
  'capabilities.name': 140,
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
  'leads.difficulty': 100,
  'leads.repeatable': 100,
  'leads.investigations': 120,

  // Agents columns
  'agents.id': 120,
  'agents.state': 140,
  'agents.assignment': 140,
  'agents.skill': 140,
  'agents.hit_points': 80,
  'agents.recovery': 90,
  'agents.exhaustion': 100,
  'agents.skill_simple': 50,
  'agents.hit_points_max': 50,
  'agents.service': 80,
  'agents.missions_total': 70,
  'agents.mission': 180,
  'agents.by': 170,

  // Lead Investigations columns
  'lead_investigations.lead_investigation_title': 200,
  'lead_investigations.agents': 80,
  'lead_investigations.intel': 50,
  'lead_investigations.success_chance': 80,
  'lead_investigations.intel_decay': 140,
  'lead_investigations.projected_intel': 120,

  // Combat Log columns
  'combat_log.attack_id': 50,
  'combat_log.round_number': 50,
  'combat_log.agent_id': 100,
  'combat_log.enemy_id': 150,
  'combat_log.attacker_type': 80,
  'combat_log.outcome': 90,
  'combat_log.attacker_skill': 130,
  'combat_log.defender_skill': 130,
  'combat_log.roll': 70,
  'combat_log.threshold': 110,
  'combat_log.damage': 180,
  'combat_log.defender_hp': 110,

  // Battle Log columns
  'battle_log.round_number': 50,
  'battle_log.status': 100,
  'battle_log.agent_count': 70,
  'battle_log.agent_skill': 150,
  'battle_log.agent_hp': 140,
  'battle_log.enemy_count': 70,
  'battle_log.enemy_skill': 150,
  'battle_log.enemy_hp': 140,
  'battle_log.skill_ratio': 60,

  // Mission Site Details columns
  'mission_site_details.key': 140,
  'mission_site_details.value': 240,
} as const
