var JCSDLConfig = {
	// list of all possible targets and their fields and their types
	targets : {
		// general interaction
		interaction : {
			name : 'Interaction',
			fields : {
				content : {name: 'Content', type: 'string', input: 'text', operators: ['contains', 'substr', 'contains_any']},
				type : {name: 'Type', type: 'string', input: 'text', operators: ['otherThan', 'equals', 'in']},
				title : {name: 'Title', type: 'string', input: 'text', operators: ['equals', 'contains', 'substr', 'contains_any']},
				author : {
					name: 'Author',
					fields: {
						id : {name: 'ID', type: 'int', input: 'text', operators: ['otherThan', 'equals', 'in']},
						name : {name: 'Name', type: 'string', input: 'text', operators: ['contains', 'substr', 'contains_any']},
						username : {name: 'User Name', type: 'string', input: 'text', operators: ['otherThan', 'equals', 'in', 'contains', 'substr', 'contains_any']}
					}
				}
			}
		},

		// twitter
		twitter : {
			name : 'Twitter',
			fields : {
				text : {name: 'Tweet', type: 'string', input: 'text', operators: ['contains', 'substr', 'contains_any']},
				mentions : {name: 'Mentions', type: 'string', input: 'text', operators: ['contains', 'substr', 'contains_any', 'in', 'equals']},
				domains : {name: 'Domains', type: 'string', input: 'text', operators: ['contains', 'substr', 'equals', 'in', 'otherThan']},
				source : {name: 'Source', type: 'string', input: 'text', operators: ['equals', 'otherThan', 'contains', 'in', 'substr', 'contains_any']},
				user : {
					name: 'Author',
					fields : {
						id : {name: 'ID', type: 'string', input: 'text', operators: ['equals', 'otherThan', 'in']},
						name : {name: 'Name', type: 'string', input: 'text', operators: ['equals', 'otherThan', 'contains', 'substr', 'contains_any']},
						description : {name: 'Description', type: 'string', input: 'text', operators: ['contains', 'substr', 'contains_any']},
						followers_count : {name: 'No. of Followers', type: 'int', input: 'text', operators: ['equals', 'otherThan', 'greaterThan', 'lowerThan']},
						location : {name: 'Location', type: 'string', input: 'text', operators: ['contains', 'substr', 'contains_any', 'equals', 'otherThan']}
					}
				},
				place : {
					name: 'Place',
					fields : {
						country_code : {name: 'Country Code', type: 'string', input: 'text', operators: ['equals', 'otherThan', 'in']}
					}
				},
				retweet : {
					name: 'Retweet',
					fields : {
						count : {name: 'No. of Retweets', type: 'int', input: 'text', operators: ['equals', 'otherThan', '>', '<', 'greaterThan', 'lowerThan']},
						text : {name: 'Text of Retweet', type: 'string', input: 'text', operators: ['contains', 'substr', 'contains_any']},
						user : {
							name: 'Author',
							fields : {
								id : {name: 'ID', type: 'int', input: 'text', operators: ['equals', 'otherThan']},
								name : {name: 'Name', type: 'string', input: 'text', operators: ['equals', 'otherThan', 'contains', 'substr', 'contains_any']},
								description : {name: 'Description', type: 'string', input: 'text', operators: ['contains', 'substr', 'contains_any']},
								followers_count : {name: 'No. of Followers', type: 'int', input: 'text', operators: ['equals', 'otherThan', 'greaterThan', 'lowerThan']},
								location : {name: 'Location', type: 'string', input: 'text', operators: ['contains', 'substr', 'contains_any', 'equals', 'otherThan']}
							}
						}
					}
				}
			}
		},

		// facebook
		facebook : {
			name : 'Facebook',
			fields : {
				message : {name: 'Message', type: 'string', input: 'text', operators: ['contains', 'substr', 'contains_any']},
				name : {name: 'Name', type: 'string', input: 'text', operators: ['equals', 'contains', 'substr', 'contains_any', 'in']},
				type : {name: 'Type', type: 'string', input: 'text', operators: ['equals', 'in', 'otherThan']},
				application : {name: 'Application', type: 'string', input: 'text', operators: ['equals', 'otherThan', 'substr', 'contains', 'contains_any']},
				author : {
					name: 'Author',
					fields : {
						id : {name: 'ID', type: 'int', input: 'text', operators: ['equals', 'otherThan', 'in']},
						name : {name: 'Name', type: 'string', input: 'text', operators: ['equals', 'in', 'otherThan', 'contains', 'substr', 'contains_any']}	
					}
				},
				likes : {
					name: 'Likes',
					fields : {
						names : {name: 'Names', type: 'string', input: 'text', operators: ['contains', 'substr', 'contains_any', 'in']},
						count : {name: 'Count', type: 'int', input: 'text', operators: ['otherThan', 'equals', 'greaterThan', 'lowerThan']}
					}
				}
			}
		}
	},

	// some additional definition of the possible operators
	operators : {
		contains : {
			description : 'Contains ALL of the following',
			code : 'contains'
		},
		substr : {
			description : 'Contains substring',
			code : 'substr'
		},
		contains_any : {
			description : 'Contains ANY of the following',
			code : 'contains_any'
		},
		otherThan : {
			description : 'Is different than the following',
			code : '!='
		},
		equals : {
			description : 'Equals',
			code : '=='
		},
		'in' : {
			description : 'Is one of the following',
			code : 'in'
		},
		greaterThan : {
			description : 'Greater than',
			code : '>='
		},
		lowerThan : {
			description : 'Lower than',
			code : '<='
		}
	},

	// some additional definition of the possible input types
	inputs : {
		text : {}
	}

};