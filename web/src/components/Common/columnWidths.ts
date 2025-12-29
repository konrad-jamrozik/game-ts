// Source of truth for all column widths across all data grids
// All get*Columns.tsx files must use constants from this file, never define widths directly

export const columnWidths = {
  // Situation Report columns
  'situation_report.metric': 146,
  'situation_report.value': 160,

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
  'missions.threat': 80,
  'missions.id': 340,
  'missions.state': 120,
  'missions.expires_in': 70,
  'missions.enemies': 80,
  'missions.avg_skill': 80,
  'missions.details': 100,

  // Leads columns
  'leads.id': 300,
  'leads.difficulty': 120,
  'leads.repeatable': 60,
  'leads.investigations': 180,

  // Lead Investigations columns
  'lead_investigations.name': 300,
  'lead_investigations.agents': 60,
  'lead_investigations.intel': 64,
  'lead_investigations.success_chance': 80,
  'lead_investigations.resistance': 120,
  'lead_investigations.projected_intel': 120,

  // Agents columns
  'agents.id': 120,
  'agents.state': 140,
  'agents.assignment': 140,
  'agents.skill': 160,
  'agents.hit_points': 80,
  'agents.recovery': 90,
  'agents.exhaustionPct': 70,
  'agents.skill_simple': 70,
  'agents.training': 70,
  'agents.hit_points_max': 50,
  'agents.service': 140,
  'agents.missions_total': 70,
  'agents.mission': 80,
  'agents.by': 170,

  // Mission Details columns
  'mission_details.key': 160,
  'mission_details.value': 240,

  // Battle Log columns
  'battle_log.round_number': 50,
  'battle_log.status': 100,
  'battle_log.agent_count': 80,
  'battle_log.agent_skill': 130,
  'battle_log.agent_hp': 130,
  'battle_log.enemy_count': 80,
  'battle_log.enemy_skill': 130,
  'battle_log.enemy_hp': 130,
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
  'combat_log.roll_diff': 90,
  'combat_log.damage': 100,
  'combat_log.defender_hp': 100,
} as const
