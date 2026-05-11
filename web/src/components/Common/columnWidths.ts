// Source of truth for all column widths across all data grids
// All get*Columns.tsx files must use constants from this file, never define widths directly

export const columnWidths = {
  // Situation Report columns
  'situation_report.metric': 146,
  'situation_report.value': 160,

  // Assets columns
  'assets.name': 150,
  'assets.value': 80,

  // Capacities columns
  'capacities.name': 130,
  'capacities.value': 100,
  'capacities.upgrade': 100,
  'capacities.price': 100,

  // Operations summary columns
  'operations_summary.name': 150,
  'operations_summary.count': 70,

  // Missions columns
  'missions.combat_rating': 80,
  'missions.id': 400,
  'missions.state': 120,
  'missions.expires_in': 70,
  'missions.enemies': 80,
  'missions.avg_skill': 80,
  'missions.details': 100,
  'missions.turn': 70,

  // Leads screen columns
  'leads_screen.lead': 340,
  'leads_screen.difficulty': 80,
  'leads_screen.repeatable': 100,
  'leads_screen.investigation': 130,
  'leads_screen.investigation_id': 72,
  'leads_screen.agents': 80,
  'leads_screen.progress': 100,
  'leads_screen.projected': 100,
  'leads_screen.efficiency': 80,
  'leads_screen.success_chance': 130,

  // Agents columns
  'agents.id': 120,
  'agents.state': 160,
  'agents.assignment': 140,
  'agents.skill': 160,
  'agents.hit_points': 80,
  'agents.recovery': 90,
  'agents.exhaustionPct': 70,
  'agents.skill_simple': 70,
  'agents.experience': 70,
  'agents.training': 70,
  'agents.hit_points_max': 50,
  'agents.service': 140,
  'agents.kills': 60,
  'agents.damage_dealt': 70,
  'agents.damage_received': 70,
  'agents.missions_total': 70,
  'agents.mission': 80,
  'agents.by': 170,
  'agents.terminated': 80,

  // Agents grid on Missions screen
  'agents.missions.cr': 72,
  'agents.missions.unavailable': 120,
  'mission_details.key': 190,
  'mission_details.value': 240,

  // Battle Log columns
  'battle_log.round_number': 50,
  'battle_log.agent_count': 80,
  'battle_log.agent_skill': 130,
  'battle_log.agent_hp': 130,
  'battle_log.agent_combat_rating': 100,
  'battle_log.enemy_count': 80,
  'battle_log.enemy_skill': 130,
  'battle_log.enemy_hp': 130,
  'battle_log.enemy_combat_rating': 100,
  'battle_log.combat_rating_ratio': 100,

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
