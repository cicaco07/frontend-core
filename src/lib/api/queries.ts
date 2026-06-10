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
