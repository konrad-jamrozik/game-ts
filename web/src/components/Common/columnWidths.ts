// Source of truth for all column widths across all data grids
// All get*Columns.tsx files must use constants from this file, never define widths directly

export const columnWidths = {
  // Situation Report columns
  'situation_report.metric_width': 120,
  'situation_report.value_width': 80,
  'situation_report.projected_width': 150,

  // Assets columns
  'assets.name_width': 160,
  'assets.value_width': 100,
  'assets.projected_width': 120,

  // Capabilities columns
  'capabilities.name_width': 140,
  'capabilities.value_width': 100,
  'capabilities.upgrade_width': 100,
  'capabilities.price_width': 100,

  // Missions columns
  'missions.id_width': 240,
  'missions.state_width': 120,
  'missions.expires_in_width': 90,
  'missions.enemies_width': 80,
  'missions.avg_skill_width': 80,
  'missions.details_width': 100,

  // Leads columns
  'leads.id_width': 300,
  'leads.difficulty_width': 100,
  'leads.repeatable_width': 100,
  'leads.investigations_width': 120,

  // Agents columns
  'agents.id_width': 120,
  'agents.state_width': 140,
  'agents.assignment_width': 140,
  'agents.skill_width': 140,
  'agents.hit_points_width': 80,
  'agents.recovery_width': 90,
  'agents.exhaustion_width': 100,
  'agents.skill_simple_width': 50,
  'agents.hit_points_max_width': 50,
  'agents.service_width': 80,
  'agents.missions_total_width': 70,
  'agents.mission_width': 180,
  'agents.by_width': 170,

  // Lead Investigations columns
  'lead_investigations.lead_investigation_title_width': 200,
  'lead_investigations.agents_width': 80,
  'lead_investigations.intel_width': 50,
  'lead_investigations.success_chance_width': 80,
  'lead_investigations.intel_decay_width': 140,
  'lead_investigations.projected_intel_width': 120,

  // Combat Log columns
  'combat_log.attack_id_width': 50,
  'combat_log.round_number_width': 50,
  'combat_log.agent_id_width': 100,
  'combat_log.enemy_id_width': 150,
  'combat_log.attacker_type_width': 80,
  'combat_log.outcome_width': 90,
  'combat_log.attacker_skill_width': 130,
  'combat_log.defender_skill_width': 130,
  'combat_log.roll_width': 70,
  'combat_log.threshold_width': 110,
  'combat_log.damage_width': 180,
  'combat_log.defender_hp_width': 110,

  // Battle Log columns
  'battle_log.round_number_width': 50,
  'battle_log.status_width': 100,
  'battle_log.agent_count_width': 70,
  'battle_log.agent_skill_width': 150,
  'battle_log.agent_hp_width': 140,
  'battle_log.enemy_count_width': 70,
  'battle_log.enemy_skill_width': 150,
  'battle_log.enemy_hp_width': 140,
  'battle_log.skill_ratio_width': 60,

  // Mission Site Details columns
  'mission_site_details.key_width': 140,
  'mission_site_details.value_width': 240,
} as const
