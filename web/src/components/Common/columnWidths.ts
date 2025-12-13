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

  // Mission sites columns
  'mission_sites.id': 340,
  'mission_sites.state': 120,
  'mission_sites.expires_in': 70,
  'mission_sites.enemies': 80,
  'mission_sites.avg_skill': 80,
  'mission_sites.details': 100,

  // Leads columns
  'leads.id': 300,
  'leads.difficulty': 120,
  'leads.repeatable': 60,
  'leads.investigations': 140,

  // Lead Investigations columns
  'lead_investigations.lead_investigation_title': 200,
  'lead_investigations.agents': 60,
  'lead_investigations.intel': 64,
  'lead_investigations.success_chance': 80,
  'lead_investigations.resistance': 120,
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
  'agents.service': 100,
  'agents.missions_total': 70,
  'agents.mission': 80,
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
  'combat_log.attack_id': 70,
  'combat_log.round_number': 50,
  'combat_log.agent_id': 100,
  'combat_log.enemy_id': 170,
  'combat_log.attacker_type': 90,
  'combat_log.effect': 70,
  'combat_log.attacker_skill': 150,
  'combat_log.defender_skill': 150,
  'combat_log.roll': 190,
  'combat_log.damage': 90,
  'combat_log.defender_hp': 130,
} as const
