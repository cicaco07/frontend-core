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
			base_stats {
				hp
				hp_regen
				mana
				mana_regen
				physical_attack
				magic_power
				physical_defense
				magic_defense
				movement_speed
				attack_speed
				attack_speed_ratio
				spell_vamp_ratio
			}
			skills {
				_id
				name
				type
				tag
				skill_icon
				lite_description
				full_description
				attack_effect
				skills_detail {
					_id
					level
					attributes
				}
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
			base_stats {
				hp
				hp_regen
				mana
				mana_regen
				physical_attack
				magic_power
				physical_defense
				magic_defense
				movement_speed
				attack_speed
				attack_speed_ratio
				spell_vamp_ratio
			}
			skills {
				_id
				name
				type
				tag
				lite_description
				full_description
				attack_effect
				skills_detail {
					_id
					level
					attributes
				}
			}
		}
		items {
			_id
			name
			type
			tag
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
