export const HERO_LIST_QUERY = `
	query HeroesList {
		heroes {
			_id
			name
			alias
			avatar
			image
			role
			type
			short_description
			difficulty
		}
	}
`;

export const HERO_DETAIL_QUERY = `
	query HeroDetail($id: ID!) {
		hero(id: $id) {
			_id
			name
			alias
			avatar
			image
			role
			type
			difficulty
			short_description
			baseStat {
				hp
				hp_growth
				hp_regen
				hp_regen_growth
				mana
				mana_growth
				mana_regen
				mana_regen_growth
				physical_attack
				physical_attack_growth
				magic_power
				magic_power_growth
				physical_defense
				physical_defense_growth
				magic_defense
				magic_defense_growth
				movement_speed
				attack_speed
				spell_vamp_ratio
				lifesteal
				crit_rate
				crit_damage
				physical_pen
				magical_pen
			}
			skills {
				_id
				name
				type
				tag
				lite_description
				full_description
				attack_effect
			}
		}
	}
`;

export const ITEMS_QUERY = `
	query ItemsList {
		items {
			_id
			name
			type
			tag
			tier
			price
			image
			attributes
			description
			story
			tips
		}
	}
`;

export const EMBLEMS_QUERY = `
	query EmblemsList {
		emblems {
			_id
			name
			type
			icon
			description
			benefit
			cooldown
			attributes
		}
	}
`;

export const THEORYCRAFTER_QUERY = `
	query TheorycrafterData {
		heroes {
			_id
			name
			alias
			avatar
			image
			role
			type
			difficulty
			short_description
			baseStat {
				hp
				hp_growth
				hp_regen
				hp_regen_growth
				mana
				mana_growth
				mana_regen
				mana_regen_growth
				physical_attack
				physical_attack_growth
				magic_power
				magic_power_growth
				physical_defense
				physical_defense_growth
				magic_defense
				magic_defense_growth
				movement_speed
				attack_speed
				spell_vamp_ratio
				lifesteal
				crit_rate
				crit_damage
				physical_pen
				magical_pen
			}
			skills {
				_id
				name
				type
				tag
				lite_description
				full_description
				attack_effect
			}
		}
		items {
			_id
			name
			type
			tag
			tier
			price
			image
			attributes
			description
		}
		emblems {
			_id
			name
			type
			icon
			description
			benefit
			attributes
		}
	}
`;
