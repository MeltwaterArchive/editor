var JCSDLConfig = {
	// list of all possible targets and their fields and their types
	targets : {

		// digg
		digg : {
			name : 'Digg',
			fields : {
				comment : {
					name : 'Comments',
					fields : {
						buries : {name: 'Buries', type: 'int', input: 'slider', operators: ['greaterThan', 'lowerThan'], max : 2000, step : 10, default : 1000},
						diggs : {name: 'Diggs', type: 'int', input: 'slider', operators: ['greaterThan', 'lowerThan'], max : 2000, step : 10, default : 1000},
						text : {name: 'Text', icon: 'content', type: 'string', cs: true, cs: true, input: 'text', operators: ['exists', 'contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']}
					}
				},
				'item-comments' : {name: 'Comments Count', icon: 'comments-count', type: 'int', input: 'slider', operators: ['equals', 'greaterThan', 'lowerThan'], max : 1000, default : 20, step : 5},
				'item-description' : {name: 'Description', icon: 'description', type: 'string', cs: true, cs: true, input: 'text', operators: ['exists', 'contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				'item-diggs' : {name: 'Diggs', icon: 'diggs', type: 'int', input: 'slider', operators: ['equals', 'greaterThan', 'lowerThan'], max : 2000, default : 100, step : 10},
				'item-status' : {name: 'Status', icon: 'status', type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				'item-title' : {name: 'Title', icon: 'title', type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				'item-topic' : {name: 'Topic', icon: 'topic', type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				type : {name: 'Type', type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				user : {
					name : 'User',
					fields : {
						fullname : {name: 'Full Name', type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						icon : {name: 'Icon', icon: 'avatar', type: 'string', cs: true, input: 'text', operators: ['exists']},
						links : {name: 'Links', icon: 'link', type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'in', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						name : {name: 'Name', icon: 'username', type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						profileviews : {name: 'Profile Views', type: 'int', input: 'slider', operators: ['greaterThan', 'lowerThan'], max : 10000, default : 100, step : 25},
						registered : {name: 'Registered',  type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']}
					}
				}
			}
		},

		// twitter
		twitter : {
			name : 'Twitter',
			fields : {
				domains : {name: 'Domains',  type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'in', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				geo : {name: 'Location', type: 'geo', input: ['geo_box', 'geo_radius', 'geo_polygon', 'geo_text'], operators: ['exists', 'geo_box', 'geo_radius', 'geo_polygon']},
				in_reply_to_screen_name : {name: 'In Reply To',  icon: 'inreply', type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				links : {name: 'Links', icon: 'link', type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'in', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				mentions : {name: 'Mentions',  type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				source : {name: 'Source',  type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				text : {name: 'Tweet', icon: 'tweet', type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				user : {
					name: 'Author',
					fields : {
						description : {name: 'Description', icon: 'user-description', type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						followers_count : {name: 'Followers Count', type: 'int', input: 'slider', operators: ['greaterThan', 'lowerThan'], max : 50000, default : 1000, step : 100},
						follower_ratio : {name: 'Follower Ratio', type: 'float', input: 'slider', operators: ['equals', 'greaterThan', 'lowerThan'], max : 10, step : 0.1, default : 2},
						friends_count : {name: 'Friends Count', type: 'int', input: 'slider', operators: ['greaterThan', 'lowerThan'], max : 50000, default : 1000, step : 100},
						id : {name: 'ID', icon: 'user-id', type: 'int', input: 'number', operators: ['exists', 'equals', 'different', 'in']},
						lang : {name: 'Language', icon: 'language', type: 'string', input: 'select', optionsSet: 'language', operators: ['exists', 'different', 'in']},
						listed_count : {name: 'Listed Count', type: 'int', input: 'slider', operators: ['greaterThan', 'lowerThan'], max : 1000, default : 500},
						location : {name: 'Location', type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						name : {name: 'Name', icon: 'username', type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						profile_age : {name: 'Age', icon: 'age', type: 'int', input: 'slider', operators: ['exists', 'equals', 'greaterThan', 'lowerThan'], min : 7, max : 100, default : 21},
						screen_name : {name: 'Screen Name',  type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						statuses_count : {name: 'Statuses Count', type: 'int', input: 'slider', operators: ['greaterThan', 'lowerThan'], max : 10000, default : 50},
						time_zone : {name: 'Time Zone',  type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						url : {name: 'URL', icon: 'url', type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']}
					}
				},
				place : {
					name: 'Place',
					fields : {
						attributes : {name: 'Attributes', icon: 'placeattrs', type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'in', 'equals', 'different', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						country : {name: 'Country', type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						country_code : {name: 'Country Code', type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						full_name : {name: 'Full Name', icon: 'fullname', type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						name : {name: 'Name', icon: 'placename', type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						place_type : {name: 'Place Type', icon: 'type', type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						url : {name: 'URL', type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']}
					}
				},
				retweet : {
					name: 'Retweet',
					fields : {
						count : {name: 'No. of Retweets', type: 'int', input: 'slider', operators: ['exists', 'equals', 'different', 'greaterThan', 'lowerThan'], max : 10000, default : 100},
						domains : {name: 'Domains',  type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'in', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						elapsed : {name: 'Elapsed', type: 'int', input: 'number', operators: ['exists', 'equals', 'different', 'greaterThan', 'lowerThan']},
						links : {name: 'Links', icon: 'link', type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'in', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						source : {name: 'Source',  type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						text : {name: 'Tweet', icon: 'tweet', type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						user : null // look at the bottom of the file
					}
				},
				retweeted : {
					name : 'Retweeted',
					fields : {
						id : {name: 'ID', type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						mentions : {name: 'Mentions',  type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						source : {name: 'Source',  type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						place : null, // look at the bottom of the file
						user : null // look at the bottom of the file
					}
				}
			}
		},

		// general interaction
		interaction : {
			name : 'All',
			fields : {
				content : {name: 'Content', type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				geo : {name: 'Location', type: 'geo', input: ['geo_box', 'geo_radius', 'geo_polygon', 'geo_text'], operators: ['exists', 'geo_box', 'geo_radius', 'geo_polygon']},
				link : {name: 'Link', type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				sample : {name: 'sample', type: 'float', input: 'slider', operators: ['lowerThan'], displayFormat : function(v) { return v + '%';}},
				source : {name: 'Source', type: 'string', cs: true, input: 'text', operators: ['contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				type : {name: 'Type', type: 'string', input: 'select', operators: ['in'], options: {'twitter': 'Twitter', 'myspace': 'MySpace', 'facebook': 'Facebook', 'digg': 'Digg', '2ch': '2ch', 'amazon': 'Amazon', 'youtube': 'YouTube', 'dailymotion': 'DailyMotion'}},
				title : {name: 'Title', type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				author : {
					name: 'Author',
					icon : 'user',
					fields: {
						id : {name: 'ID', icon: 'user-id', type: 'int', input: 'text', operators: ['exists', 'equals', 'different', 'greaterThan', 'lowerThan']},
						avatar : {name: 'Avatar', type: 'string', cs: true, input: 'text', operators: ['exists']},
						link : {name: 'Link', type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						name : {name: 'Name', icon: 'fullname', type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						username : {name: 'User Name', type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']}
					}
				}
			}
		},

		// facebook
		facebook : {
			name : 'Facebook',
			fields : {
				application : {name: 'Application', type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				'author-avatar': {name: 'Author Avatar', icon: 'avatar', type: 'string', cs: true, input: 'text', operators: ['exists']},
				'author-id': {name: 'Author ID', icon: 'user-id', type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				'author-link': {name: 'Author Link', icon: 'link', type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				'author-name': {name: 'Author Name', icon: 'username', type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				caption : {name: 'Caption', type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				'likes-count' : {name: 'Likes Count', type: 'int', input: 'slider', operators: ['exists', 'greaterThan', 'lowerThan'], max : 10000, default : 500, step : 10},
				'likes-ids' : {name: 'Likes IDs', type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'in', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				'likes-names' : {name: 'Likes Names', type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				link : {name: 'Link', type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				message : {name: 'Message',type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				name : {name: 'Name', icon: 'fullname', type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				og : {
					name : 'Open Graph',
					icon : 'opengraph',
					fields : {
						by : {name: 'By', icon: 'og-by', type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						description : {name: 'Description', icon: 'description', type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						//length : {name: 'Length', icon: 'og-length', type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						location : {name: 'Location', icon: 'location', type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						photos : {name: 'Photos', icon: 'photos', type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						title : {name: 'Title', type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						type : {name: 'Type', type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']}
					}
				},
				source : {name: 'Source',type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				'to-ids' : {name: 'To IDs', type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				'to-names' : {name: 'To Names', type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				type : {name: 'Type', type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']}
			}
		},

		// myspace
		myspace : {
			name : 'MySpace',
			fields : {
				author : {
					name : 'Author',
					icon : 'user',
					fields : {
						avatar : {name: 'Avatar', type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						id : {name: 'ID', icon: 'user-id', type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						link : {name: 'Link', type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						name : {name: 'Name', icon: 'fullname', type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						username : {name: 'User Name', type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']}
					}
				},
				category : {name: 'Category', type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				content : {name: 'Content', type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				contenttype : {name: 'Content Type', icon: 'type', type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				geo : {name: 'Location', type: 'geo', input: ['geo_box', 'geo_radius', 'geo_polygon', 'geo_text'], operators: ['exists', 'geo_box', 'geo_radius', 'geo_polygon']},
				link : {name: 'Link', type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				verb : {name: 'Verb', type: 'string', cs: true, input: 'text', operators: ['exists', 'contains', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']}
			}
		}

	},

	// some additional definition of the possible operators
	operators : {
		contains : {
			label : 'Filter a word or phrase',
			description : 'Filter for a word or phrase.',
			code : 'contains'
		},
		substr : {
			label : 'Filter characters',
			description : 'Filter for a sequence of characters.',
			code : 'substr'
		},
		contains_any : {
			label : 'Filter words',
			description : 'Filter for one or more words.',
			code : 'contains_any'
		},
		contains_near : {
			label : 'Filter two words',
			description : 'Two or more words that occur near each other.',
			code : 'contains_near'
		},
		different : {
			label : 'Different',
			description : 'Is different than the following.',
			code : '!='
		},
		equals : {
			label : 'Equals',
			description : 'Equals',
			code : '=='
		},
		'in' : {
			label : 'Filter values from a list',
			description : 'Filter for one or more values from a list.',
			code : 'in'
		},
		greaterThan : {
			label : '&gt;=',
			description : 'Greater than.',
			code : '>='
		},
		lowerThan : {
			label : '&lt;=',
			description : 'Lower than.',
			code : '<='
		},
		exists : {
			label : 'Data exists',
			description : 'This data exists.',
			code : 'exists'
		},
		regex_partial : {
			label : 'Partial Regex',
			description : 'Filter for content that contains text represented in a regular expression. The text can appear anywhere within the target you select.',
			code : 'regex_partial'
		},
		regex_exact : {
			label : 'Exact Regex',
			description : 'Filter for content that contains text represented in a regular expression. The regular expression must match the entire content of the target you choose.',
			code : 'regex_exact'
		},
		geo_box : {
			description : 'Filter for content originating from geographical locations within a bounding box.',
			code : 'geo_box'
		},
		geo_radius : {
			description : 'Filter for posts originating inside a circle.',
			code : 'geo_radius'
		},
		geo_polygon : {
			description : 'Filter for content originating from geographical locations defined by a polygon with up to 32 vertices.',
			code : 'geo_polygon'
		}
	},

	// some additional config for some input types
	inputs : {
		select : {
			sets : {
				language : {'af': 'Afrikaans', 'bg': 'Bulgarian', 'zh': 'Chinese', 'cs': 'Czech', 'da': 'Danish', 'nl': 'Dutch', 'en': 'English', 'et': 'Estonian', 'fi': 'Finnish', 'fr': 'French', 'de': 'German', 'el': 'Greek', 'he': 'Hebrew', 'hu': 'Hungarian', 'is': 'Icelandic', 'it': 'Italian', 'ja': 'Japanese', 'ko': 'Korean', 'la': 'Latin', 'lt': 'Lithuanian', 'lv': 'Latvian', 'no': 'Norwegian', 'pl': 'Polish', 'pt': 'Portuguese', 'ro': 'Romanian', 'ru': 'Russian', 'es': 'Spanish', 'sv': 'Swedish', 'tl': 'Tagalog'}
			}
		},
		slider : {
			min : 0,
			max : 100,
			step : 1,
			default: 50,
			displayFormat : function(v) {return v;}
		},
		geo_box : {
			operators : ['geo_box']
		},
		geo_radius : {
			operators : ['geo_radius']
		},
		geo_polygon : {
			operators : ['geo_polygon']
		},
		geo_text : {
			operators : ['geo_text']
		}
	}

};

JCSDLConfig.targets.twitter.fields.retweet.fields.user = JCSDLConfig.targets.twitter.fields.user;
JCSDLConfig.targets.twitter.fields.retweeted.fields.place = JCSDLConfig.targets.twitter.fields.place;
JCSDLConfig.targets.twitter.fields.retweeted.fields.user = JCSDLConfig.targets.twitter.fields.user;