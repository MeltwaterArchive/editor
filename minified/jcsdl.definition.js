var JCSDLDefinition = {
	name : 'datasift',
	
	// list of all possible targets and their fields and their types
	targets : {

		// general interaction
		interaction : {
			name : 'All',
			fields : {
				content : {name: 'Content', type: 'string', cs: true, input: 'text', operators: ['exists', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				geo : {name: 'Location', type: 'geo', input: ['geo_box', 'geo_radius', 'geo_polygon'], operators: ['exists', 'geo_box', 'geo_radius', 'geo_polygon']},
				link : {name: 'Link', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				sample : {name: 'sample', type: 'float', input: 'slider', operators: ['lowerThan'], displayFormat : function(v) { return v + '%';}},
				source : {name: 'Source', type: 'string', cs: true, input: 'text', operators: ['equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				type : {name: 'Type', type: 'string', input: 'select', operators: ['in'], options: {'2ch':'2channel','amazon':'Amazon','blog':'Blog','board':'Board','dailymotion':'DailyMotion','facebook':'Facebook','flickr':'Flickr','imdb':'IMDb','reddit':'Reddit','topic':'Topix','twitter':'Twitter','video':'Videos','youtube':'YouTube'}},
				title : {name: 'Title', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				author : {
					name: 'Author',
					icon : 'user',
					fields: {
						id : {name: 'ID', icon: 'user-id', type: 'int', input: 'text', operators: ['exists', 'equals', 'different', 'greaterThan', 'lowerThan']},
						avatar : {name: 'Avatar', type: 'string', cs: true, input: 'text', operators: ['exists']},
						link : {name: 'Link', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						name : {name: 'Name', icon: 'fullname', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						username : {name: 'User Name', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']}
					}
				}
			}
		},

		// twitter
		twitter : {
			name : 'Twitter',
			fields : {
				domains : {name: 'Domains',  type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'in', 'substr', 'different', 'regex_partial', 'regex_exact']},
				geo : {name: 'Location', type: 'geo', input: ['geo_box', 'geo_radius', 'geo_polygon'], operators: ['geo_box', 'geo_radius', 'geo_polygon']},
				in_reply_to_screen_name : {name: 'In Reply To',  icon: 'inreply', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'different', 'regex_partial', 'regex_exact']},
				links : {name: 'Links', icon: 'link', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'in', 'substr', 'different', 'regex_partial', 'regex_exact']},
				mentions : {name: 'Mentions',  type: 'string', cs: true, input: 'text', operators: ['exists', 'in', 'equals', 'substr']},
				source : {name: 'Source',  type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'different', 'regex_partial', 'regex_exact']},
				text : {name: 'Tweet', icon: 'tweet', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact'], operator: 'contains_any'},
				user : {
					name: 'Author',
					fields : {
						description : {name: 'Description', icon: 'user-description', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact'], operator: 'contains_any'},
						followers_count : {name: 'Followers Count', type: 'int', input: 'slider', operators: ['greaterThan', 'lowerThan'], max : 50000, 'default' : 1000, step : 100},
						follower_ratio : {name: 'Follower Ratio', type: 'float', input: 'slider', operators: ['greaterThan', 'lowerThan'], max : 10, step : 0.1, 'default' : 2},
						friends_count : {name: 'Friends Count', type: 'int', input: 'slider', operators: ['greaterThan', 'lowerThan'], max : 50000, 'default' : 1000, step : 100},
						id : {name: 'ID', icon: 'user-id', type: 'int', input: 'number', operators: ['exists', 'equals', 'different', 'in'], operator: 'in'},
						lang : {name: 'Language', icon: 'language', type: 'string', input: 'select', optionsSet: 'language', operators: ['exists', 'in']},
						listed_count : {name: 'Listed Count', type: 'int', input: 'slider', operators: ['greaterThan', 'lowerThan'], max : 1000, 'default' : 500},
						location : {name: 'Location', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						name : {name: 'Name', icon: 'username', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						profile_age : {name: 'Age', icon: 'age', type: 'int', input: 'slider', operators: ['exists', 'equals', 'greaterThan', 'lowerThan'], min : 7, max : 100, 'default' : 21},
						screen_name : {name: 'Screen Name',  type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						statuses_count : {name: 'Statuses Count', type: 'int', input: 'slider', operators: ['greaterThan', 'lowerThan'], max : 10000, 'default' : 50},
						time_zone : {name: 'Time Zone',  type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						url : {name: 'URL', icon: 'url', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'different', 'regex_partial', 'regex_exact']}
					}
				},
				place : {
					name: 'Place',
					fields : {
						attributes : {name: 'Attributes', icon: 'placeattrs', type: 'string', cs: true, input: 'text', operators: ['exists', 'in', 'equals', 'different', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						country : {name: 'Country', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						country_code : {name: 'Country Code', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						full_name : {name: 'Full Name', icon: 'fullname', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						name : {name: 'Name', icon: 'placename', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						place_type : {name: 'Place Type', icon: 'type', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						url : {name: 'URL', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']}
					}
				},
				retweet : {
					name: 'Retweet',
					fields : {
						count : {name: 'No. of Retweets', type: 'int', input: 'slider', operators: ['exists', 'equals', 'different', 'greaterThan', 'lowerThan'], max : 10000, 'default' : 100},
						domains : {name: 'Domains',  type: 'string', cs: true, input: 'text', operators: ['exists', 'in', 'substr', 'different', 'regex_partial', 'regex_exact']},
						elapsed : {name: 'Elapsed', type: 'int', input: 'number', operators: ['exists', 'equals', 'different', 'greaterThan', 'lowerThan']},
						links : {name: 'Links', icon: 'link', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'in', 'substr', 'different', 'regex_partial', 'regex_exact']},
						source : {name: 'Source',  type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'different', 'regex_partial', 'regex_exact']},
						text : {name: 'Tweet', icon: 'tweet', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						user : null // look at the bottom of the file
					}
				},
				retweeted : {
					name : 'Retweeted',
					fields : {
						id : {name: 'ID', type: 'string', cs: true, input: 'text', operators: ['exists', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						source : {name: 'Source',  type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'different', 'regex_partial', 'regex_exact']},
						place : null, // look at the bottom of the file
						user : null // look at the bottom of the file
					}
				}
			}
		},

		// facebook
		facebook : {
			name : 'Facebook',
			fields : {
				application : {name: 'Application', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				'author-avatar': {name: 'Author Avatar', icon: 'avatar', type: 'string', cs: true, input: 'text', operators: ['exists']},
				'author-id': {name: 'Author ID', icon: 'user-id', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'different', 'in']},
				'author-link': {name: 'Author Link', icon: 'link', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				'author-name': {name: 'Author Name', icon: 'username', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				caption : {name: 'Caption', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				'likes-count' : {name: 'Likes Count', type: 'int', input: 'slider', operators: ['exists', 'greaterThan', 'lowerThan'], max : 10000, 'default' : 500, step : 10},
				'likes-ids' : {name: 'Likes IDs', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'in', 'different']},
				'likes-names' : {name: 'Likes Names', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				link : {name: 'Link', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				message : {name: 'Message',type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				name : {name: 'Name', icon: 'fullname', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				og : {
					name : 'Open Graph',
					icon : 'opengraph',
					fields : {
						by : {name: 'By', icon: 'og-by', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						description : {name: 'Description', icon: 'description', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						//length : {name: 'Length', icon: 'og-length', type: 'string', cs: true, input: 'text', operators: ['exists', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						location : {name: 'Location', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						photos : {name: 'Photos', icon: 'photos', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						title : {name: 'Title', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						type : {name: 'Type', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']}
					}
				},
				source : {name: 'Source',type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				'to-ids' : {name: 'To IDs', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'different']},
				'to-names' : {name: 'To Names', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				type : {name: 'Type', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']}
			}
		},

		'2channel' : {
			name : '2channel',
			fields : {
				'author-name' : {name: 'Author Name', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				content : {name: 'Content', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				contenttype : {name: 'Content Type', type: 'string', input: 'select', single: true, options: {'HTML':'html'}, operators: ['exists', 'equals', 'different']},
				link : {name: 'Link', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				thread : {name: 'Thread', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				title : {name: 'Title', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				type : {name: 'Type', type: 'string', input: 'select', single: true, options: {'thread':'Thread','post':'Post'}, operators: ['exists', 'equals', 'different']}
			}
		},

		amazon : {
			name : 'Amazon',
			fields : {
				author : {
					name : 'Author',
					icon : 'user',
					fields : {
						link : {name: 'Author Link', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						name : {name: 'Author Name', icon: 'author-name', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']}
					}
				},
				content : {name: 'Content', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				contenttype : {name: 'Content Type', type: 'string', input: 'select', single: true, options: {'HTML':'html'}, operators: ['exists', 'equals', 'different']},
				link : {name: 'Link', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				thread : {name: 'Thread', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				title : {name: 'Title', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				type : {name: 'Type', type: 'string', input: 'select', single: true, options: {'thread':'Thread','post':'Post'}, operators: ['exists', 'equals', 'different']}
			}
		},

		blog : {
			name : 'Blog',
			fields : {
				author : {
					name : 'Author',
					icon : 'user',
					fields : {
						avatar : {name: 'Avatar', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						link : {name: 'Author Link', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						name : {name: 'Author Name', icon: 'author-name', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						username : {name: 'User Name', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']}
					}
				},
				content : {name: 'Content', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				contenttype : {name: 'Content Type', type: 'string', input: 'select', single: true, options: {'HTML':'html'}, operators: ['exists', 'equals', 'different']},
				domain : {name: 'Domain', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				link : {name: 'Link', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				post : {
					name : 'Post',
					fields : {
						link : {name: 'Link', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						title : {name: 'Title', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']}
					}
				},
				title : {name: 'Title', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				type : {name: 'Type', type: 'string', input: 'select', single: true, options: {'thread':'Thread','post':'Post'}, operators: ['exists', 'equals', 'different']}
			}
		},

		board : {
			name : 'Board',
			fields : {
				author : {
					name : 'Author',
					icon : 'user',
					fields : {
						age : {name: 'Age', type: 'int', input: 'slider', operators: ['exists', 'equals', 'greaterThan', 'lowerThan'], min : 7, max : 100, 'default' : 21},
						avatar : {name: 'Avatar', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						gender : {name: 'Gender', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						link : {name: 'Author Link', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						location : {name: 'Location', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						name : {name: 'Author Name', icon: 'author-name', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						registered : {name: 'Registered',  type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						signature : {name: 'Signature',  type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						username : {name: 'User Name', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']}
					}
				},
				content : {name: 'Content', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				contenttype : {name: 'Content Type', type: 'string', input: 'select', single: true, options: {'HTML':'html'}, operators: ['exists', 'equals', 'different']},
				domain : {name: 'Domain', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				link : {name: 'Link', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				thread : {name: 'Thread', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				title : {name: 'Title', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				type : {name: 'Type', type: 'string', input: 'select', single: true, options: {'thread':'Thread','post':'Post'}, operators: ['exists', 'equals', 'different']}
			}
		},

		dailymotion : {
			name : 'DailyMotion',
			fields : {
				author : {
					name : 'Author',
					icon : 'user',
					fields : {
						link : {name: 'Author Link', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						username : {name: 'Author Name', icon: 'author-name', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']}
					}
				},
				category : {name: 'Category', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				content : {name: 'Content', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				contenttype : {name: 'Content Type', type: 'string', input: 'select', single: true, options: {'HTML':'html'}, operators: ['exists', 'equals', 'different']},
				duration : {name: 'Duration', type: 'int', input: 'slider', operators: ['exists', 'equals', 'greaterThan', 'lowerThan'], min : 0, max : 10800, 'default' : 3600, displayFormat : function(v) {return v + 's';}},
				tags : {name: 'Tags', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				thumbnail : {name: 'Thumbnail', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				title : {name: 'Title', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				videolink : {name: 'Video Link', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']}
			}
		},

		flickr : {
			name : 'Flickr',
			fields : {
				author : {
					name : 'Author',
					icon : 'user',
					fields : {
						link : {name: 'Author Link', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						name : {name: 'Author Name', icon: 'author-name', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						username : {name: 'User Name', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']}
					}
				},
				content : {name: 'Content', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				contenttype : {name: 'Content Type', type: 'string', input: 'select', single: true, options: {'HTML':'html'}, operators: ['exists', 'equals', 'different']},
				link : {name: 'Link', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				thread : {name: 'Thread', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				title : {name: 'Title', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				type : {name: 'Type', type: 'string', input: 'select', single: true, options: {'thread':'Thread','post':'Post'}, operators: ['exists', 'equals', 'different']}
			}
		},

		imdb : {
			name : 'IMDb',
			fields : {
				author : {
					name : 'Author',
					icon : 'user',
					fields : {
						link : {name: 'Author Link', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						name : {name: 'Author Name', icon: 'author-name', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']}
					}
				},
				content : {name: 'Content', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				contenttype : {name: 'Content Type', type: 'string', input: 'select', single: true, options: {'HTML':'html'}, operators: ['exists', 'equals', 'different']},
				link : {name: 'Link', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				thread : {name: 'Thread', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				title : {name: 'Title', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				type : {name: 'Type', type: 'string', input: 'select', single: true, options: {'thread':'Thread','post':'Post'}, operators: ['exists', 'equals', 'different']}
			}
		},

		newscred : {
			name : 'NewsCred',
			fields : {
				article : {
					name : 'Article',
					fields : {
						authors : {name: 'Authors', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						category : {name: 'Category', type: 'string', input: 'select', operators: ['exists', 'equals', 'different', 'in'], optionsSet: 'newscredCategories'},
						content : {name: 'Content', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						domain : {name: 'Domain', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						title : {name: 'Title', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						topics : {name: 'Topics', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']}
					}
				},
				image : {
					name : 'Image',
					fields : {
						'attribution-link' : {name: 'Attribution Link', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						'attribution-text' : {name: 'Attribution Text', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						caption : {name: 'Caption', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']}
					}
				},
				'source-domain' : {name: 'Source Domain', icon: 'domain', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				type : {name: 'Type', type: 'string', input: 'select', single: true, options: {'article':'Article','video':'Video','image':'Image'}, operators: ['exists', 'equals', 'different']},
				video : {
					name : 'Video',
					fields : {
						caption : {name: 'Caption', icon: 'video-caption', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						category : {name: 'Category', type: 'string', input: 'select', operators: ['exists', 'equals', 'different', 'in'], optionsSet: 'newscredCategories'},
						domain : {name: 'Domain', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						title : {name: 'Title', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						topics : {name: 'Topics', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']}
					}
				}
			}
		},

		reddit : {
			name : 'Reddit',
			fields : {
				author : {
					name : 'Author',
					icon : 'user',
					fields : {
						link : {name: 'Author Link', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						name : {name: 'Author Name', icon: 'author-name', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']}
					}
				},
				content : {name: 'Content', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				contenttype : {name: 'Content Type', type: 'string', input: 'select', single: true, options: {'HTML':'html'}, operators: ['exists', 'equals', 'different']},
				link : {name: 'Link', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				thread : {name: 'Thread', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				title : {name: 'Title', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				type : {name: 'Type', type: 'string', input: 'select', single: true, options: {'thread':'Thread','post':'Post'}, operators: ['exists', 'equals', 'different']}
			}
		},

		topix : {
			name : 'Topix',
			fields : {
				author : {
					name : 'Author',
					icon : 'user',
					fields : {
						location : {name: 'Location', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						name : {name: 'Author Name', icon: 'author-name', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']}
					}
				},
				content : {name: 'Content', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				contenttype : {name: 'Content Type', type: 'string', input: 'select', single: true, options: {'HTML':'html'}, operators: ['exists', 'equals', 'different']},
				link : {name: 'Link', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				thread : {name: 'Thread', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				title : {name: 'Title', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				type : {name: 'Type', type: 'string', input: 'select', single: true, options: {'thread':'Thread','post':'Post'}, operators: ['exists', 'equals', 'different']}
			}
		},

		video : {
			name : 'Video',
			fields : {
				author : {
					name : 'Author',
					icon : 'user',
					fields : {
						avatar : {name: 'Avatar', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						link : {name: 'Author Link', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						name : {name: 'Author Name', icon: 'author-name', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						username : {name: 'User Name', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']}
					}
				},
				category : {name: 'Category', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				commentslink : {name: 'Comments Link', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				content : {name: 'Content', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				contenttype : {name: 'Content Type', type: 'string', input: 'select', single: true, options: {'HTML':'html'}, operators: ['exists', 'equals', 'different']},
				domain : {name: 'Domain', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				duration : {name: 'Duration', type: 'int', input: 'slider', operators: ['exists', 'equals', 'greaterThan', 'lowerThan'], min : 0, max : 10800, 'default' : 3600, displayFormat : function(v) {return v + 's';}},
				tags : {name: 'Tags', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				thumbnail : {name: 'Thumbnail', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				title : {name: 'Title', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				type : {name: 'Type', type: 'string', input: 'select', single: true, options: {'video':'Video','comment':'Comment'}, operators: ['exists', 'equals', 'different']},
				videolink : {name: 'Video Link', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']}
			}
		},

		youtube : {
			name : 'YouTube',
			fields : {
				author : {
					name : 'Author',
					icon : 'user',
					fields : {
						link : {name: 'Author Link', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						name : {name: 'Author Name', icon: 'author-name', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']}
					}
				},
				category : {name: 'Category', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				commentslink : {name: 'Comments Link', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				content : {name: 'Content', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				duration : {name: 'Duration', type: 'int', input: 'slider', operators: ['exists', 'equals', 'greaterThan', 'lowerThan'], min : 0, max : 10800, 'default' : 3600, displayFormat : function(v) {return v + 's';}},
				tags : {name: 'Tags', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				thumbnail : {name: 'Thumbnail', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
				title : {name: 'Title', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact'], operator: 'contains_any'},
				type : {name: 'Type', type: 'string', input: 'select', single: true, options: {'video':'Video','comment':'Comment'}, operators: ['exists', 'equals', 'different']},
				videolink : {name: 'Video Link', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']}
			}
		},

		augmentation : {
			name : 'Augmentations',
			fields : {
				klout : {
					name : 'Klout',
					fields : {
						amplification : {name: 'Amplification', type: 'int', input: 'slider', operators: ['exists', 'equals', 'greaterThan', 'lowerThan'], min: 0, max: 100, 'default': 50},
						network : {name: 'Network Effect', type: 'int', input: 'slider', operators: ['exists', 'equals', 'greaterThan', 'lowerThan'], min: 0, max: 100, 'default': 50},
						score : {name: 'Score', type: 'int', input: 'slider', operators: ['exists', 'equals', 'greaterThan', 'lowerThan'], min: 0, max: 100, 'default': 50},
						topics : {name: 'Topics', icon: 'topic', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						true_reach : {name: 'True Reach', type: 'int', input: 'slider', operators: ['exists', 'equals', 'greaterThan', 'lowerThan'], min: 0, max: 100000, 'default': 1000}
					}
				},
				links : {
					name : 'Links',
					fields : {
						age : {name: 'Age', type: 'int', input: 'number', operators: ['equals', 'greaterThan', 'lowerThan'], operator: 'greaterThan'},
						title : {name: 'Title', type: 'string', input: 'text', operators: ['equals', 'substr', 'contains_any', 'contains_near', 'regex_partial', 'regex_exact'], operator: 'contains_any'},
						domain : {name: 'Domain', type: 'string', input: 'text', operators: ['substr', 'in', 'equals', 'regex_partial', 'regex_exact'], operator: 'in'},
						url : {name: 'URL', type: 'string', input: 'text', operators: ['substr', 'in', 'equals', 'regex_partial', 'regex_exact'], operator: 'in'},
						retweet_count : {name: 'Retweet Count', icon: 'retweet-count', type: 'int', input: 'slider', operators: ['greaterThan', 'lowerThan', 'equals'], operator: 'greaterThan', min: 0, max: 10000, 'default': 5000}
					}
				},
				trends : {
					name : 'Trends',
					fields : {
						type : {name: 'Type', type: 'string', input: 'text', operators: ['equals', 'in', 'contains_any', 'substr', 'regex_partial', 'regex_exact'], operator: 'equals'},
						content : {name: 'Content', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
						source : {name: 'Source', type: 'string', input: 'select', single: true, operators: ['equals'], operator: 'equals', options: {'twitter':'Twitter'}}
					}
				},
				'language-tag' : {name: 'Language', icon: 'language', type: 'string', input: 'select', optionsSet: 'language', operators: ['equals', 'in', 'different'], operator: 'in'},
				'demographic-gender' : {name: 'Demographic', icon: 'demographic', type: 'string', input: 'select', single: true, options: {'male':'Male','mostly_male':'Mostly Male','mostly_female':'Mostly Female','female':'Female','unisex':'Unisex'}, operators: ['equals']},
				salience : {
					name : 'Salience',
					fields : {
						content : {
							name: 'Content',
							fields : {
								sentiment : {name: 'Sentiment', type: 'int', input: 'slider', operators: ['greaterThan', 'lowerThan'], min: -100, max: 100, 'default': 0},
								topics : {name: 'Topics', type: 'string', input: 'select', operators: ['in'], optionsSet: 'salienceTopics'}
							}
						},
						title : {
							name: 'Title',
							fields : {
								sentiment : {name: 'Sentiment', type: 'int', input: 'slider', operators: ['greaterThan', 'lowerThan'], min: -100, max: 100, 'default': 0},
								topics : {name: 'Topics', type: 'string', input: 'select', operators: ['in'], optionsSet: 'salienceTopics'}
							}
						}
					}
				}
			}
		}

	},

	// some additional definition of the possible operators
	operators : {
		substr : {
			label : 'Substring',
			description : 'Filter for a sequence of characters that form a word or part of a word.',
			code : 'substr',
			jsonp : 'http://dev.datasift.com/tooltip-endpoint/tooltip/retrieve?callback=jcsdlJSONP&id=substr'
		},
		contains_any : {
			label : 'Contains words',
			description : 'Filter for one or more string values from a list of strings.',
			code : 'contains_any',
			jsonp : 'http://dev.datasift.com/tooltip-endpoint/tooltip/retrieve?callback=jcsdlJSONP&id=contains_any'
		},
		contains_near : {
			label : 'Contains words near',
			description : 'Filter for two or more words that occur near to each other.',
			code : 'contains_near',
			jsonp : 'http://dev.datasift.com/tooltip-endpoint/tooltip/retrieve?callback=jcsdlJSONP&id=contains_near'
		},
		different : {
			label : 'Different',
			description : 'Not equal to...',
			code : '!=',
			jsonp : 'http://dev.datasift.com/tooltip-endpoint/tooltip/retrieve?callback=jcsdlJSONP&id=equals-and-not-equals'
		},
		equals : {
			label : 'Equals',
			description : 'Equal to...',
			code : '==',
			jsonp : 'http://dev.datasift.com/tooltip-endpoint/tooltip/retrieve?callback=jcsdlJSONP&id=equals-and-not-equals'
		},
		'in' : {
			label : 'In',
			description : 'Filter for one or more values from a list.',
			code : 'in',
			jsonp : 'http://dev.datasift.com/tooltip-endpoint/tooltip/retrieve?callback=jcsdlJSONP&id=in'
		},
		greaterThan : {
			label : '&gt;=',
			description : 'Greater than...',
			code : '>='
		},
		lowerThan : {
			label : '&lt;=',
			description : 'Lower than...',
			code : '<=',
		},
		exists : {
			label : 'Exists',
			description : 'Check whether a target is present.',
			code : 'exists',
			jsonp : 'http://dev.datasift.com/tooltip-endpoint/tooltip/retrieve?callback=jcsdlJSONP&id=exists'
		},
		regex_partial : {
			label : 'Partial Regex',
			description : 'Filter for content by a regular expression that matches any part of the target.',
			code : 'regex_partial',
			jsonp : 'http://dev.datasift.com/tooltip-endpoint/tooltip/retrieve?callback=jcsdlJSONP&id=regex_partial'
		},
		regex_exact : {
			label : 'Exact Regex',
			description : 'Filter for content by a regular expression that matches the entire target.',
			code : 'regex_exact',
			jsonp : 'http://dev.datasift.com/tooltip-endpoint/tooltip/retrieve?callback=jcsdlJSONP&id=regex_exact'
		},
		geo_box : {
			label : 'Geo Box',
			description : 'Filter for content originating from geographical locations within a bounding box.',
			code : 'geo_box'
		},
		geo_radius : {
			label : 'Geo Radius',
			description : 'Filter for posts originating inside a circle.',
			code : 'geo_radius'
		},
		geo_polygon : {
			label : 'Geo Polygon',
			description : 'Filter for content originating from geographical locations defined by a polygon with up to 32 vertices.',
			code : 'geo_polygon'
		}
	},

	targetHelpJsonpSource : 'http://dev.datasift.com/tooltip-endpoint/tooltip/retrieve?callback=jcsdlJSONP&id={target}',
	//targetHelpJsonpSource : 'http://doctest.devcloud.acquia-sites.com/tooltip-endpoint/tooltip/retrieve?callback=jcsdlJSONP&id={target}',

	// some additional config for some input types
	inputs : {
		text : {
			// list of operators for which the input field is a "tag" input field
			arrayOperators : ['contains_any', 'contains_near', 'in'],
			operator : 'contains_any'
		},
		number : {
			arrayOperators : ['in'],
			operator : 'equals'
		},
		select : {
			operator : 'in',
			sets : {
				language : {'af': 'Afrikaans', 'bg': 'Bulgarian', 'zh': 'Chinese', 'cs': 'Czech', 'da': 'Danish', 'nl': 'Dutch', 'en': 'English', 'et': 'Estonian', 'fi': 'Finnish', 'fr': 'French', 'de': 'German', 'el': 'Greek', 'he': 'Hebrew', 'hu': 'Hungarian', 'is': 'Icelandic', 'it': 'Italian', 'ja': 'Japanese', 'ko': 'Korean', 'la': 'Latin', 'lt': 'Lithuanian', 'lv': 'Latvian', 'no': 'Norwegian', 'pl': 'Polish', 'pt': 'Portuguese', 'ro': 'Romanian', 'ru': 'Russian', 'es': 'Spanish', 'sv': 'Swedish', 'tl': 'Tagalog'},
				salienceTopics : {'Advertising':'Advertising','Agriculture':'Agriculture','Art':'Art','Automotive':'Automotive','Aviation':'Aviation','Banking':'Banking','Beverages':'Beverages','Biotechnology':'Biotechnology','Business':'Business','Crime':'Crime','Disasters':'Disasters','Economics':'Economics','Education':'Education','Elections':'Elections','Energy':'Energy','Fashion':'Fashion','Food':'Food','Hardware':'Hardware','Health':'Health','Hotels':'Hotels','Intellectual Property':'Intellectual Property','Investing':'Investing','Labor':'Labor','Law':'Law','Marriage':'Marriage','Mobile Devices':'Mobile Devices','Politics':'Politics','Real Estate':'Real Estate','Renewable Energy':'Renewable Energy','Robotics':'Robotics','Science':'Science','Social Media':'Social Media','Software and Internet':'Software and Internet','Space':'Space','Sports':'Sports','Technology':'Technology','Traditional':'Traditional','Travel':'Travel','Video Games':'Video Games','War':'War','Weather':'Weather'},
				newscredCategories : {'Africa':'Africa', 'Asia':'Asia', 'Business':'Business', 'Entertainment':'Entertainment', 'Environment':'Environment', 'Europe':'Europe', 'Health':'Health', 'Lifestyle':'Lifestyle', 'Other':'Other', 'Politics':'Politics', 'Regional':'Regional', 'Sports':'Sports', 'Technology':'Technology', 'Travel':'Travel', 'U.K.':'U.K.', 'U.S.':'U.S.', 'World':'World'}
			}
		},
		slider : {
			operator : 'greaterThan',
			min : 0,
			max : 100,
			step : 1,
			'default': 50,
			displayFormat : function(v) {return v;}
		},
		geo : {

		},
		geo_box : {
			operators : ['geo_box'],
			instructions : [
				'Click on the map to mark first corner of the box.',
				'Now click on the map to mark the second corner of the box.',
				'You can drag the markers around to change the box coordinates.'
			]
		},
		geo_radius : {
			operators : ['geo_radius'],
			instructions : [
				'Click on the map to mark the center of the selection.',
				'Click again to set the radius.', 
				'You can drag the markers around to move the center of the circle or the radius.'
			]
		},
		geo_polygon : {
			operators : ['geo_polygon'],
			instructions : [
				'Click on the map to mark first tip of the polygon selection.',
				'Click on the map to mark the second tip of the polygon.',
				'Click on the map to mark the third tip and close the shape.',
				'Click on the map to add new markers or drag them around. Double-click a marker to remove it.'
			]
		}
	}

};

JCSDLDefinition.targets.twitter.fields.retweet.fields.user = JCSDLDefinition.targets.twitter.fields.user;
JCSDLDefinition.targets.twitter.fields.retweeted.fields.place = JCSDLDefinition.targets.twitter.fields.place;
JCSDLDefinition.targets.twitter.fields.retweeted.fields.user = JCSDLDefinition.targets.twitter.fields.user;