var JCSDLConfig = {
	// list of all possible targets and their fields and their types
	targets : {
		// general interaction
		interaction : {
			name : 'All',
			fields : {
				content : {name: 'Content', type: 'string', input: 'text', operators: ['contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				geo : {name: 'Location', type: 'geo', input: ['geo_box', 'geo_radius', 'geo_polygon', 'geo_text'], operators: ['geo_box', 'geo_radius', 'geo_polygon']},
				link : {name: 'Link', type: 'string', input: 'text', operators: ['contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				sample : {name: 'sample', type: 'float', input: 'slider', operators: ['equals', 'different', 'greaterThan', 'lowerThan']},
				source : {name: 'Source', type: 'string', input: 'text', operaotrs: ['contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				type : {name: 'Type', type: 'string', input: 'select', operators: ['in'], options : {twitter : 'Twitter', myspace : 'MySpace', facebook : 'Facebook', digg : 'Digg', '2ch' : '2ch', amazon : 'Amazon', youtube : 'YouTube', dailymotion : 'DailyMotion'}},
				title : {name: 'Title', type: 'string', input: 'text', operators: ['contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				author : {
					name: 'Author',
					fields: {
						id : {name: 'ID', type: 'int', input: 'text', operators: ['equals', 'different', 'greaterThan', 'lowerThan']},
						avatar : {name: 'Avatar', type: 'string', input: 'text', operators: ['contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						link : {name: 'Link', type: 'string', input: 'text', operators: ['contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						name : {name: 'Name', type: 'string', input: 'text', operators: ['contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						username : {name: 'User Name', type: 'string', input: 'text', operators: ['contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']}
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
				domains : {name: 'Domains', type: 'string', input: 'text', operators: ['contains', 'substr', 'equals', 'in', 'different']},
				source : {name: 'Source', type: 'string', input: 'text', operators: ['equals', 'different', 'contains', 'in', 'substr', 'contains_any']},
				user : {
					name: 'Author',
					fields : {
						id : {name: 'ID', type: 'string', input: 'text', operators: ['equals', 'different', 'in']},
						name : {name: 'Name', type: 'string', input: 'text', operators: ['equals', 'different', 'contains', 'substr', 'contains_any']},
						description : {name: 'Description', type: 'string', input: 'text', operators: ['contains', 'substr', 'contains_any']},
						followers_count : {name: 'No. of Followers', type: 'int', input: 'text', operators: ['equals', 'different', 'greaterThan', 'lowerThan']},
						location : {name: 'Location', type: 'string', input: 'text', operators: ['contains', 'substr', 'contains_any', 'equals', 'different']}
					}
				},
				place : {
					name: 'Place',
					fields : {
						country_code : {name: 'Country Code', type: 'string', input: 'text', operators: ['equals', 'different', 'in']}
					}
				},
				retweet : {
					name: 'Retweet',
					fields : {
						count : {name: 'No. of Retweets', type: 'int', input: 'text', operators: ['equals', 'different', '>', '<', 'greaterThan', 'lowerThan']},
						text : {name: 'Text of Retweet', type: 'string', input: 'text', operators: ['contains', 'substr', 'contains_any']},
						user : {
							name: 'Author',
							fields : {
								id : {name: 'ID', type: 'int', input: 'text', operators: ['equals', 'different']},
								name : {name: 'Name', type: 'string', input: 'text', operators: ['equals', 'different', 'contains', 'substr', 'contains_any']},
								description : {name: 'Description', type: 'string', input: 'text', operators: ['contains', 'substr', 'contains_any']},
								followers_count : {name: 'No. of Followers', type: 'int', input: 'text', operators: ['equals', 'different', 'greaterThan', 'lowerThan']},
								location : {name: 'Location', type: 'string', input: 'text', operators: ['contains', 'substr', 'contains_any', 'equals', 'different']}
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
				type : {name: 'Type', type: 'string', input: 'text', operators: ['equals', 'in', 'different']},
				application : {name: 'Application', type: 'string', input: 'text', operators: ['equals', 'different', 'substr', 'contains', 'contains_any']},
				author : {
					name: 'Author',
					fields : {
						id : {name: 'ID', type: 'int', input: 'text', operators: ['equals', 'different', 'in']},
						name : {name: 'Name', type: 'string', input: 'text', operators: ['equals', 'in', 'different', 'contains', 'substr', 'contains_any']}	
					}
				},
				likes : {
					name: 'Likes',
					fields : {
						names : {name: 'Names', type: 'string', input: 'text', operators: ['contains', 'substr', 'contains_any', 'in']},
						count : {name: 'Count', type: 'int', input: 'text', operators: ['different', 'equals', 'greaterThan', 'lowerThan']}
					}
				}
			}
		},

		// blog
		blog : {
			name : 'Blog',
			fields : {
				content : {name: 'Content', type: 'string', input: 'text', operators: ['contains', 'substr', 'contains_any']}
			}
		},

		// board
		board : {
			name : 'Discussion Board',
			fields : {
				content : {name: 'Content', type: 'string', input: 'text', operators: ['contains', 'substr', 'contains_any']}
			}
		}
	},

	// some additional definition of the possible operators
	operators : {
		contains : {
			description : 'Filter for a word or phrase',
			code : 'contains'
		},
		substr : {
			description : 'Filter for a sequence of characters',
			code : 'substr'
		},
		contains_any : {
			description : 'Filter for one or more words',
			code : 'contains_any'
		},
		contains_near : {
			description : 'Two or more words that occur near each other',
			code : 'contains_near'
		},
		exists : {
			description : 'Check whether this data exists',
			code : 'exists'
		},
		different : {
			description : 'Is different than the following',
			code : '!='
		},
		equals : {
			description : 'Equals',
			code : '=='
		},
		'in' : {
			description : 'Filter for one or more values from a list',
			code : 'in'
		},
		greaterThan : {
			description : 'Greater than',
			code : '>='
		},
		lowerThan : {
			description : 'Lower than',
			code : '<='
		},
		regex_partial : {
			description : 'Filter for content that contains text represented in a regular expression. The text can appear anywhere within the target you select.',
			code : 'regex_partial'
		},
		regex_exact : {
			description : 'Filter for content that contains text represented in a regular expression. The regular expression must match the entire content of the target you choose.',
			code : 'regex_exact'
		},
		geo_box : {
			description : 'Filter for content originating from geographical locations within a bounding box',
			code : 'geo_box'
		},
		geo_radius : {
			description : 'Filter for posts originating inside a circle',
			code : 'geo_radius'
		},
		geo_polygon : {
			description : 'Filter for content originating from geographical locations defined by a polygon with up to 32 vertices',
			code : 'geo_polygon'
		}
	}

};