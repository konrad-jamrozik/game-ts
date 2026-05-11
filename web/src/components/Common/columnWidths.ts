// Source of truth for all column widths across all data grids
// All get*Columns.tsx files must use constants from this file, never define widths directly

export const columnWidths = {
  // Situation Report (faction next operations + panic metrics)
  'situation_report.next_operations.metric': 150,
  'situation_report.next_operations.turns': 70,
  'situation_report.metrics.metric': 80,
  'situation_report.metrics.value': 140,

  // Event log
  'event_log.event': 360,
  'event_log.turn': 60,
  'event_log.actions_count': 60,
  'event_log.undo': 90,

  // Factions screen comparison table
  'factions.name': 150,
  'factions.activity_level': 260,
  'factions.level_progress': 150,
  'factions.next_operation': 150,
  'factions.suppression': 150,

  // Agents mini grid (Operations card)
  'operations_agents.name': 150,
  'operations_agents.value': 80,

  // Finances mini grid (Operations card)
  'operations_finances.name': 150,
  'operations_finances.value': 70,

  // Capacities DataGrid (read-only + shop)
  'capacities.name': 130,
  'capacities.value': 100,
  'capacities.upgrade': 100,
  'capacities.price': 100,

  // Leads summary mini grid (Operations card)
  'operations_leads_summary.metric': 150,
  'operations_leads_summary.count': 70,

  // Missions summary mini grid (Operations card)
  'operations_missions_summary.metric': 150,
  'operations_missions_summary.count': 70,

  // Mission sites DataGrid (Missions screen)
  'missions.combat_rating': 80,
  'missions.id': 400,
  'missions.state': 120,
  'missions.expires_in': 70,
  'missions.enemies': 80,
  'missions.avg_skill': 80,
  'missions.details': 100,
  'missions.turn': 70,

  // Leads investigations DataGrid
  'leads.lead': 340,
  'leads.difficulty': 80,
  'leads.repeatable': 100,
  'leads.investigation': 130,
  'leads.investigation_id': 72,
  'leads.agents': 80,
  'leads.progress': 100,
  'leads.projected': 100,
  'leads.efficiency': 80,
  'leads.success_chance': 130,

  // Agents roster DataGrid
  'agents.id': 120,
  'agents.state': 160,
  'agents.assignment': 140,
  'agents.skill': 160,
  'agents.hit_points': 80,
  'agents.recovery': 90,
  'agents.exhaustionPct': 110,
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

  // Agents embedded on Mission details / missions flow
  'missions_screen_agents.cr': 72,
  'missions_screen_agents.unavailable': 120,
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
