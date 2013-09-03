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
                mention_ids : {name: 'Mentions IDs', type: 'int', input: 'number', operators: ['exists', 'equals', 'different', 'in']},
                source : {name: 'Source',  type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'different', 'regex_partial', 'regex_exact']},
                status : {name: 'Status', type: 'string', input: 'select', single: true, options: {'user_protect':'Private Account','user_unprotect':'Public Account','user_suspend':'Suspended Account','user_unsuspend':'Account Released from Suspension','user_delete':'Deleted Account','user_undelete':'Restored Account','user_withheld':'User Withheld','status_withheld':'Status Withheld'}, operators: ['exists', 'equals', 'different']},
                text : {name: 'Tweet', icon: 'tweet', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact'], operator: 'contains_any'},
                user : {
                    name: 'User',
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
                        url : {name: 'URL', icon: 'url', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'different', 'regex_partial', 'regex_exact']},
                        verified : {name: 'Verified', icon: 'user_verified', type: 'int', input: 'select', options: {'1':'Verified'}, operators: ['equals']}
                    }
                },
                place : {
                    name: 'Place',
                    fields : {
                        attributes : {
                            name: 'Attributes', 
                            icon: 'placeattrs',
                            fields : {
                                locality : {name: 'Locality', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'in', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
                                region : {name: 'Region', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'in', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
                                street_address : {name: 'Street Address', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'in', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']}
                            }
                        },
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
                        mentions : {name: 'Mentions',  type: 'string', cs: true, input: 'text', operators: ['exists', 'in', 'equals', 'substr']},
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

        facebook_page : {
            name : 'Facebook Page',
            fields : {
                'comment-id' : {name: 'Comment ID', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in']},
                'from-category' : {name: 'From Category', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
                'from-id' : {name: 'From ID', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in']},
                'from-name' : {name: 'From Name', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
                id : {name: 'Long Facebook ID', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in']},
                link : {name: 'Link', type: 'string', input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
                message : {name: 'Message', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
                name : {name: 'Name', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
                object_id : {name: 'Object ID', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in']},
                page : {
                    name : 'Page',
                    fields : {
                        category : {name: 'Category', icon: 'page_category', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
                        id : {name: 'ID', icon: 'page_id', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in']},
                        link : {name: 'Link', icon: 'page_link', type: 'string', input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
                        name : {name: 'Name', icon: 'page_name', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
                        username : {name: 'User Name', icon: 'page_username', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']}
                    }
                },
                post : {
                    name : 'Post',
                    fields : {
                        id : {name: 'ID', icon: 'post_id', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in']},
                        content : {name: 'Content', icon: 'post_content', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
                        link : {name: 'Link', icon: 'post_link', type: 'string', input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
                        type : {name: 'Type', icon: 'post_type', type: 'string', input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']}
                    }
                },
                type : {name: 'Type', type: 'string', input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
                story : {name: 'Story', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
                picture : {name: 'Picture', type: 'string', input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
                source : {name: 'Source', type: 'string', input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
                'application-id' : {name: 'Applicaton ID', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in']},
                'application-name' : {name: 'Application Name', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']}
            }
        },

        '2ch' : {
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
                        title : {name: 'Title', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
                        content : {name: 'Content', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
                        fulltext : {name: 'Full Text', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
                        domain : {name: 'Domain', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
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
                source : {
                    name : 'Source',
                    fields : {
                        domain : {name: 'Source Domain', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
                        link : {name: 'Link', type: 'string', input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
                        circulation : {name: 'Circulation', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
                        name : {name: 'Name', icon: 'source_name', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
                        company_type : {name: 'Company Type', type: 'string', input: 'select', single: true, options: {'Private':'Private','Public':'Public','Cooperative':'Cooperative','Govt':'Government'}, operators: ['exists', 'equals', 'different']},
                        country : {name: 'Country', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
                        founded : {name: 'Founded', type: 'string', input: 'number', operators: ['exists', 'equals', 'different']},
                        media_type : {name: 'Media Type', type: 'string', input: 'select', single: true, options: {'blog':'Blog','mainstream':'Mainstream'}, operators: ['exists', 'equals']}
                    }
                },
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

        bitly : {
            name : 'Bit.ly',
            fields : {
                'user-agent' : {name: 'User Agent', icon: 'useragent', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
                url_hash : {name: 'URL Hash', type: 'string', input: 'text', cs: true, operators: ['exists', 'in', 'equals', 'different']},
                'share-hash' : {name: 'Share Hash', icon: 'share_hash', type: 'string', input: 'text', cs: true, operators: ['exists', 'in', 'equals', 'different']},
                cname : {name: 'CName', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
                referring_url : {name: 'Referring URL', icon: 'ref_url', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'in', 'different', 'regex_partial', 'regex_exact'], operator: 'substr'},
                referring_domain : {name: 'Referring Domain', icon: 'ref_domain', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'in', 'substr', 'different', 'regex_partial', 'regex_exact'], operator: 'in'},
                url : {name: 'URL', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'in', 'different', 'regex_partial', 'regex_exact'], operator: 'substr'},
                domain : {name: 'Domain', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'in', 'different', 'regex_partial', 'regex_exact'], operator: 'in'},
                country : {name: 'Country', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
                country_code : {name: 'Country Code', type: 'string', input: 'text', cs: true, operators: ['exists', 'in', 'equals', 'different']},
                geo_region : {name: 'Geo Region', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
                geo_region_code : {name: 'Geo Region Code', type: 'string', input: 'text', cs: true, operators: ['exists', 'in', 'equals', 'different']},
                geo_city : {name: 'Geo City', icon: 'city', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
                geo : {name: 'Geo', type: 'geo', input: ['geo_box', 'geo_radius', 'geo_polygon'], operators: ['exists', 'geo_box', 'geo_radius', 'geo_polygon']},
                timezone : {name: 'Timezone', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']}
            }
        },

        wikipedia : {
            name : 'Wikipedia',
            fields : {
                author : {
                    name : 'Author',
                    icon : 'user',
                    fields : {
                        contributions : {name: 'Author Contributions Page', icon: 'contributions', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
                        talk : {name: 'Author Talk Page', icon: 'talkpage', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']}
                    }
                },
                changetype : {name: 'Change Type', type: 'string', input: 'select', single: true, options: {'minor_edit':'Minor Edit','new_page':'New Page','bot_edit':'Automatic Edit'}, operators: ['exists', 'equals', 'different']},
                diff : {
                    name : 'Difference',
                    fields : {
                        'changes-added' : {name: 'Changes Added', icon: 'changeadded', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
                        'changes-removed' : {name: 'Changes Removed', icon: 'changeremoved', type: 'string', cs: true, input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
                        from : {name: 'From', type: 'int', icon: 'diff-from', input: 'text', operators: ['exists', 'equals', 'different', 'greaterThan', 'lowerThan']},
                        to : {name: 'To', icon: 'diff-to', type: 'int', input: 'text', operators: ['exists', 'equals', 'different', 'greaterThan', 'lowerThan']}
                    }
                },
                pageid : {name: 'Page ID', type: 'int', input: 'number', operators: ['exists', 'equals', 'different'], operator: 'equals'},
                parentid : {name: 'Parent ID', type: 'int', input: 'number', operators: ['exists', 'equals', 'different'], operator: 'equals'},
                title : {name: 'Title', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact'], operator: 'contains_any'},
                externallinks : {name: 'External Links', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'regex_partial', 'regex_exact']},
                images : {name: 'Images', icon: 'image', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'regex_partial', 'regex_exact']},
                namespace : {name: 'Namespace', type: 'string', input: 'select', single: true, options: {'Media':'Media','Special':'Special','Main':'Main','Talk':'Talk','User':'User','User talk':'User Talk','Project':'Project','Project talk':'Project Talk','File':'File talk','MediaWiki':'MediaWiki','MediaWiki talk':'MediaWiki Talk','Template':'Template','Template talk':'Template Talk','Help':'Help','Help talk':'Help Talk','Category':'Category','Category talk':'Category Talk'}, operators: ['equals']},
                newlen : {name: 'New Length', icon: 'newlength', type: 'int', input: 'slider', operators: ['equals', 'greaterThan', 'lowerThan'], min: 0, max: 10000, 'default': 1000},
                oldlen : {name: 'Old Length', icon: 'oldlength', type: 'int', input: 'slider', operators: ['equals', 'greaterThan', 'lowerThan'], min: 0, max: 10000, 'default': 1000}
            }
        },

        tumblr : {
            name : 'Tumblr',
            fields : {
                activity : {name: 'Activity', icon: 'tumblractivity', type: 'string', input: 'select', single: true, options: {'CreatePost':'Create Post', 'UpdatePost':'Update Post', 'DeletePost':'Delete Post', 'Likes':'Likes', 'Unlikes':'Unlikes'}, operators: ['exists', 'equals', 'different']},
                type : {name: 'Type', icon: 'tumblrtype', type: 'string', input: 'select', single: true, options: {'photo':'Photo','video':'Video','audio':'Audio','text':'Text','chat':'Chat','quote':'Quote','answer':'Answer','link':'Link'}, operators: ['exists', 'equals', 'different']},
                state : {name: 'State', type: 'string', input: 'select', single: true, options: {'published':'Published','queued':'Queued','draft':'Draft','private':'Private'}, operators: ['exists', 'equals', 'different']},
                'source-blogid' : {name: 'Source Blog ID', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in']},
                'dest-blogid' : {name: 'Destination Blog ID', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in']},
                'dest-postid' : {name: 'Destination Post ID', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in']},
                'root-blogid' : {name: 'Root Blog ID', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in']},
                'root-postid' : {name: 'Root Post ID', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in']},
                blogid : {name: 'Blog ID', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in']},
                blog_name : {name: 'Blog Name', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                title : {name: 'Title', icon: 'tumblrtitle', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                body : {name: 'Body', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                format : {name: 'Format', type: 'string', input: 'select', single: true, options: {'html':'HTML','markdown':'Markdown'}, operators: ['equals']},
                post_url : {name: 'Post URL', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                slug : {name: 'URL Slug', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                text : {name: 'Quote Text', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                source_html : {name: 'Quote HTML Source', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                source_url : {name: 'Source URL', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                source_title : {name: 'Source Title', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                tags : {name: 'Tags', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                note_count : {name: 'Note Count', type: 'int', input: 'slider', operators: ['equals', 'greaterThan', 'lowerThan'], min: 0, max: 10000, 'default': 50},
                question : {name: 'Question', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                answer : {name: 'Answer', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                asking_name : {name: 'Asking Name', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                asking_url : {name: 'Asking URL', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                video_url : {name: 'Video URL', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                duration : {name: 'Video Duration', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'greaterThan', 'lowerThan']},
                artist : {name: 'Artist', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                track_name : {name: 'Track Name', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                album : {name: 'Track Album', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                plays : {name: 'Track Plays', type: 'int', input: 'slider', operators: ['equals', 'greaterThan', 'lowerThan'], min: 0, max: 10000, 'default': 50},
                audio_url : {name: 'Track URL', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                link : {name: 'Photo Link', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                description : {name: 'Link Description', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                caption : {name: 'Caption', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                meta : {
                    name : 'Meta',
                    fields : {
                        url : {name: 'URL', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                        type : {name: 'Type', type: 'string', input: 'select', single: true, options: {'photo':'Photo','video':'Video','audio':'Audio','text':'Text','chat':'Chat','quote':'Quote','answer':'Answer','link':'Link'}, operators: ['exists', 'equals', 'different']},
                        description : {name: 'Description', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                        likes_local : {name: 'Local Likes', type: 'int', input: 'slider', operators: ['equals', 'greaterThan', 'lowerThan'], min: 0, max: 10000, 'default': 50},
                        likes_global : {name: 'Global Likes', type: 'int', input: 'slider', operators: ['equals', 'greaterThan', 'lowerThan'], min: 0, max: 10000, 'default': 50},
                        reblogged_global : {name: 'Reblogged', type: 'int', input: 'slider', operators: ['equals', 'greaterThan', 'lowerThan'], min: 0, max: 10000, 'default': 50}
                    }
                },
                reblogged : {
                    name : 'Reblogged',
                    fields : {
                        'from-id' : {name: 'From ID', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in']},
                        'from-url' : {name: 'From URL', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                        'from-name' : {name: 'From Name', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                        'from-title' : {name: 'From Title', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                        'root-id' : {name: 'Root ID', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in']},
                        'root-url' : {name: 'Root URL', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                        'root-name' : {name: 'Root Name', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                        'root-title' : {name: 'Root Title', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'}
                    }
                }
            }
        },

        googleplus : {
            name : 'Google+',
            fields : {
                url : {name: 'URL', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                type : {name: 'Type', type: 'string', input: 'select', single: true, options: {'activity':'Activity','comment':'Comment','plusone':'+1'}, operators: ['exists', 'equals', 'different']},
                verb : {name: 'Verb', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                title : {name: 'Title', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                'actor-id' : {name: 'Author ID', input: 'text', operators: ['exists', 'equals', 'different']},
                'actor-display_name' : {name: 'Author Name', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                'actor-url': {name: 'URL', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                'object' : {
                    name : 'Object',
                    fields : {
                        object_type : {name: 'Object Type', icon: 'type', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                        content : {name: 'Content', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                        url : {name: 'URL', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                        attachments : {
                            name : 'Attachments',
                            icon : 'attachment',
                            fields : {
                                object_type : {name: 'Type', icon: 'type', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                                display_name : {name: 'Display Name', icon: 'name', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                                content : {name: 'Content', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                                url : {name: 'URL', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'}
                            }
                        }
                    }
                },
                'in_reply_to-id' : {name: 'In Reply To: ID', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in']},
                'in_reply_to-url' : {name: 'In Reply To: URL', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                provider_title : {name: 'Provider Title', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'}
            }
        },

        instagram : {
            name : 'Instagram',
            fields : {
                type : {name: 'Type', type: 'string', input: 'select', single: true, options: {'image':'Image','video':'Video','comment':'Comment','like':'Like'}, operators: ['exists', 'equals']},
                tags : {name: 'Tags', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                filter : {name: 'Filter', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                link : {name: 'Link', icon: 'url', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                images : {
                    name : 'Images',
                    icon : 'image',
                    fields : {
                        low_resolution : {
                            name : 'Low Resolution',
                            fields : {
                                url : {name: 'URL', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                                width : {name: 'Width', type: 'int', input: 'slider', operators: ['equals', 'greaterThan', 'lowerThan'], min: 0, max: 1024, 'default': 640},
                                height : {name: 'Height', type: 'int', input: 'slider', operators: ['equals', 'greaterThan', 'lowerThan'], min: 0, max: 1024, 'default': 640}
                            }
                        },
                        thumbnail : {
                            name : 'Thumbnail',
                            fields : {
                                url : {name: 'URL', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                                width : {name: 'Width', type: 'int', input: 'slider', operators: ['equals', 'greaterThan', 'lowerThan'], min: 0, max: 1024, 'default': 640},
                                height : {name: 'Height', type: 'int', input: 'slider', operators: ['equals', 'greaterThan', 'lowerThan'], min: 0, max: 1024, 'default': 640}
                            }
                        },
                        standard_resolution : {
                            name : 'Standard Resolution',
                            fields : {
                                url : {name: 'URL', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                                width : {name: 'Width', type: 'int', input: 'slider', operators: ['equals', 'greaterThan', 'lowerThan'], min: 0, max: 1024, 'default': 640},
                                height : {name: 'Height', type: 'int', input: 'slider', operators: ['equals', 'greaterThan', 'lowerThan'], min: 0, max: 1024, 'default': 640}
                            }
                        }
                    }
                },
                videos : {
                    name : 'Videos',
                    icon : 'video',
                    fields : {
                        low_resolution : {
                            name : 'Low Resolution',
                            fields : {
                                url : {name: 'URL', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                                width : {name: 'Width', type: 'int', input: 'slider', operators: ['equals', 'greaterThan', 'lowerThan'], min: 0, max: 1024, 'default': 640},
                                height : {name: 'Height', type: 'int', input: 'slider', operators: ['equals', 'greaterThan', 'lowerThan'], min: 0, max: 1024, 'default': 640}
                            }
                        },
                        standard_resolution : {
                            name : 'Standard Resolution',
                            fields : {
                                url : {name: 'URL', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                                width : {name: 'Width', type: 'int', input: 'slider', operators: ['equals', 'greaterThan', 'lowerThan'], min: 0, max: 1024, 'default': 640},
                                height : {name: 'Height', type: 'int', input: 'slider', operators: ['equals', 'greaterThan', 'lowerThan'], min: 0, max: 1024, 'default': 640}
                            }
                        }
                    }
                },
                caption : {
                    name : 'Caption',
                    fields : {
                        text : {name: 'Text', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                        'from-id' : {name: 'From ID', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in']},
                        'from-username' : {name: 'From Username', icon: 'username', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                        'from-full_name' : {name: 'From Full Name', icon: 'fullname', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'}
                    }
                },
                from : {
                    name : 'From',
                    fields : {
                        id : {name: 'ID', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in']},
                        username : {name: 'Username', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                        full_name : {name: 'Full Name', icon: 'fullname', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                        bio : {name: 'Bio', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                    }
                },
                'location-id' : {name: 'Location ID', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in']},
                'location-name' : {name: 'Location Name', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                users_in_photo : {
                    name: 'Users in Photo',
                    fields : {
                        id : {name: 'ID', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in']},
                        full_name : {name: 'Full Name', icon: 'fullname', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                        username : {name: 'Username', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                    }
                },
                'attribution-name' : {name: 'Attribution Name', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                'attribution-website' : {name: 'Attribution Website', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                text : {name: 'Text', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                media : {
                    name : 'Media',
                    fields : {
                        caption : {name: 'Caption', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                        tags : {name: 'Tags', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                        type : {name: 'Type', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                        link : {name: 'Link', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                        id : {name: 'ID', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in']},
                        username : {name: 'Username', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'}
                    }
                },
                geo : {name: 'Geo', type: 'geo', input: ['geo_box', 'geo_radius', 'geo_polygon'], operators: ['exists', 'geo_box', 'geo_radius', 'geo_polygon']}
            }
        },

        yammer : {
            name : 'Yammer',
            fields : {
                type : {name: 'Type', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                message_type : {name: 'Message Type', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                direct_message : {name: 'Direct Message', type: 'int', input: 'select', operators: ['exists', 'equals'], options: {'0':'0','1':'1'}},
                url : {name: 'URL', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                privacy : {name: 'Privacy', type: 'string', input: 'select', single: true, options: {'private':'Private','public':'Public'}, operators: ['exists', 'equals']},
                sender_type : {name: 'Sender Type', type: 'string', input: 'select', single: true, options: {'user':'User','system':'System'}, operators: ['exists', 'equals']},
                web_url : {name: 'Web Url', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                client_type : {name: 'Client Type', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                content_excerpt : {name: 'Content Excerpt', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                body : {
                    name : 'Body',
                    fields : {
                        rich : {name: 'Rich Body', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                        parsed : {name: 'Parsed Body', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                        plain : {name: 'Plain Body', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'}
                    }
                },
                thread : {
                    name : 'Thread',
                    fields : {
                        'stats-shares' : {name: 'Shares Stats', icon: 'shares', type: 'int', input: 'slider', operators: ['exists', 'equals', 'greaterThan', 'lowerThan'], min: 0, max: 10000, 'default': 500},
                        'stats-updates' : {name: 'Updates Stats', icon: 'updates', type: 'int', input: 'slider', operators: ['exists', 'equals', 'greaterThan', 'lowerThan'], min: 0, max: 10000, 'default': 500},
                        direct_message : {name: 'Direct Message', type: 'int', input: 'select', operators: ['exists', 'equals'], options: {'0':'0','1':'1'}},
                        id : {name: 'ID', type: 'int', input: 'text', operators: ['exists', 'equals']},
                        url : {name: 'URL', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                        privacy : {name: 'Privacy', type: 'string', input: 'select', single: true, options: {'private':'Private','public':'Public'}, operators: ['exists', 'equals']},
                        web_url : {name: 'Web Url', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                    }
                },
                group : {
                    name : 'Group',
                    fields : {
                        name : {name: 'Name', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                        id : {name: 'ID', type: 'int', input: 'text', operators: ['exists', 'equals', 'different', 'in']},
                        office365_url : {name: 'Office 365 URL', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                        url : {name: 'URL', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                        description : {name: 'Description', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                        privacy : {name: 'Privacy', type: 'string', input: 'select', single: true, options: {'private':'Private','public':'Public'}, operators: ['exists', 'equals']},
                        web_url : {name: 'Web Url', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                        full_name : {name: 'Full Name', icon: 'fullname', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                        'stats-followers' : {name: 'Followers Stats', icon: 'followers', type: 'int', input: 'slider', operators: ['exists', 'equals', 'greaterThan', 'lowerThan'], min: 0, max: 10000, 'default': 500},
                        'stats-following' : {name: 'Following Stats', icon: 'following', type: 'int', input: 'slider', operators: ['exists', 'equals', 'greaterThan', 'lowerThan'], min: 0, max: 10000, 'default': 500},
                        'stats-updates' : {name: 'Updates Stats', icon: 'updates', type: 'int', input: 'slider', operators: ['exists', 'equals', 'greaterThan', 'lowerThan'], min: 0, max: 10000, 'default': 500}
                    }
                },
                sender : {
                    name : 'Sender',
                    fields : {
                        job_title : {name: 'Job Title', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                        name : {name: 'Name', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                        id : {name: 'ID', type: 'int', input: 'text', operators: ['exists', 'equals', 'different', 'in']},
                        url : {name: 'URL', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                        type : {name: 'Type', type: 'string', input: 'select', single: true, options: {'user':'User','system':'System'}, operators: ['exists', 'equals']},
                        web_url : {name: 'Web Url', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'},
                        full_name : {name: 'Full Name', icon: 'fullname', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in', 'substr', 'contains_any', 'contains_near', 'regex_exact', 'regex_partial'], operator: 'contains_any'}
                    }
                }
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
                        title : {name: 'Title', type: 'string', input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact', 'in'], operator: 'contains_any'},
                        domain : {name: 'Domain', type: 'string', input: 'text', operators: ['exists', 'substr', 'in', 'equals', 'regex_partial', 'regex_exact'], operator: 'equals'},
                        url : {name: 'URL', type: 'string', input: 'text', operators: ['exists', 'equals', 'in', 'different', 'substr', 'regex_partial', 'regex_exact', 'contains_any'], operator: 'equals'},
                        normalized_url : {name: 'Normalized URL', type: 'string', input: 'text', operators: ['exists', 'equals', 'in', 'different', 'substr', 'regex_partial', 'regex_exact', 'contains_any'], operator: 'equals'},
                        hops : {name: 'Hops', type: 'string', input: 'text', operators: ['exists', 'equals', 'in', 'different', 'substr', 'regex_partial', 'regex_exact', 'contains_any'], operator: 'equals'},
                        code : {name: 'HTTP Code', icon: 'http_code', type: 'int', input: 'select', single: false, options: {'200':'200 OK','202':'202 Accepted','204':'204 No Content','300':'300 Multiple Choices','301':'301 Moved Permanently','302':'302 Found','303':'303 See Other','304':'304 Not Modified','307':'Temporary Redirect','400':'400 Bad Request','401':'401 Unauthorized','403':'403 Forbidden','404':'404 Not Found','405':'405 Method Not Allowed','406':'406 Not Acceptable','408':'408 Request Timeout','500':'500 Internal Server Error','502':'502 Bad Gateway','503':'503 Service Unavailable'}, operators: ['exists', 'equals', 'different', 'in'], operator: 'equals'},
                        meta : {
                            name : 'Meta',
                            icon : 'metatags',
                            fields : {
                                content_type : {name: 'Content Type', icon: 'contenttype', type: 'string', input: 'text', operators: ['exists', 'equals', 'substr', 'different', 'contains_any', 'regex_partial', 'regex_exact', 'in'], operator: 'equals'},
                                charset : {name: 'Charset', type: 'string', input: 'text', operators: ['exists', 'different', 'in', 'regex_partial', 'regex_exact'], operator: 'in'},
                                lang : {name: 'Language', icon: 'language', type: 'string', input: 'text', operators: ['exists', 'substr', 'in', 'equals', 'different', 'regex_ partial', 'regex_exact'], operator: 'equals'},
                                keywords : {name: 'Keywords', type: 'string', input: 'text', operators: ['exists', 'equals', 'substr', 'in', 'contains_any', 'different', 'regex_partial', 'regex_exact'], operator: 'in'},
                                description : {name: 'Description', type: 'string', input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'different', 'regex_partial', 'regex_exact'], operator: 'contains_any'},
                                newskeywords : {name: 'Google News Keywords', type: 'string', input: 'text', operators: ['exists', 'equals', 'in', 'substr', 'contains_any', 'different', 'regex_partial', 'regex_exact'], operator: 'in'},
                                standout : {name: 'Google News Standout Link', type: 'string', input: 'text', operators: ['exists', 'equals', 'in', 'substr', 'contains_any', 'different', 'regex_partial', 'regex_exact'], operator: 'contains_any'},
                                opengraph : {
                                    name : 'Open Graph',
                                    fields : {
                                        type : {name: 'Object Type', type: 'string', input: 'text', operators: ['exists', 'equals', 'in', 'contains_any', 'different', 'regex_partial', 'regex_exact'], operator: 'in'},
                                        title : {name: 'Object Title', type: 'string', input: 'text', operators: ['exists', 'equals', 'substr', 'contains_any', 'different', 'regex_partial', 'regex_exact'], operator: 'in'},
                                        image : {name: 'Object Image URL', type: 'string', input: 'text', operators: ['exists', 'equals', 'in', 'different', 'substr', 'regex_partial', 'regex_exact', 'contains_any'], operator: 'equals'},
                                        url : {name: 'Object Canonical URL', type: 'string', input: 'text', operators: ['exists', 'equals', 'in', 'different', 'substr', 'regex_partial', 'regex_exact', 'contains_any'], operator: 'equals'},
                                        description : {name: 'Description', type: 'string', input: 'text', operators: ['exists', 'equals', 'substr', 'contains_near', 'different', 'regex_partial', 'regex_exact'], operator: 'contains_any'},
                                        site_name : {name: 'Site Name', type: 'string', input: 'text', operators: ['exists', 'equals', 'in', 'contains_any', 'substr', 'regex_partial', 'regex_exact'], operator: 'in'},
                                        email : {name: 'Email', type: 'string', input: 'text', operators: ['exists', 'equals', 'in', 'different', 'substr', 'regex_partial', 'regex_exact', 'contains_any'], operator: 'equals'},
                                        phone_number : {name: 'Phone Number', type: 'string', input: 'text', operators: ['exists', 'equals', 'in', 'different', 'substr', 'regex_partial', 'regex_exact', 'contains_any'], operator: 'equals'},
                                        fax_number : {name: 'Fax Number', type: 'string', input: 'text', operators: ['exists', 'equals', 'in', 'different', 'substr', 'regex_partial', 'regex_exact', 'contains_any'], operator: 'equals'},
                                        street_address : {name: 'Street Address', type: 'string', input: 'text', operators: ['exists', 'equals', 'contains_any', 'substr', 'different', 'regex_partial', 'regex_exact'], operator: 'equals'},
                                        locality : {name: 'Locality', type: 'string', input: 'text', operators: ['exists', 'equals', 'contains_any', 'substr', 'different', 'regex_partial', 'regex_exact'], operator: 'equals'},
                                        region : {name: 'Region', type: 'string', input: 'text', operators: ['exists', 'equals', 'contains_any', 'substr', 'different', 'regex_partial', 'regex_exact'], operator: 'equals'},
                                        postal_code : {name: 'Postal Code', type: 'string', input: 'text', operators: ['exists', 'equals', 'different', 'in'], operator: 'contains_any'},
                                        activity : {name: 'Activity', type: 'string', input: 'text', operators: ['exists', 'equals', 'any', 'substr', 'regex_partial', 'regex_exact', 'in'], operator: 'contains_any'},
                                        sport : {name: 'Sport', type: 'string', input: 'text', operators: ['exists', 'equals', 'any', 'substr', 'regex_partial', 'regex_exact', 'in'], operator: 'contains_any'},
                                        bar : {name: 'Bar', type: 'string', input: 'text', operators: ['exists', 'equals', 'any', 'substr', 'regex_partial', 'regex_exact', 'in'], operator: 'contains_any'},
                                        company : {name: 'Company', type: 'string', input: 'text', operators: ['exists', 'equals', 'any', 'substr', 'regex_partial', 'regex_exact', 'in'], operator: 'contains_any'},
                                        cafe : {name: 'Cafe', type: 'string', input: 'text', operators: ['exists', 'equals', 'any', 'substr', 'regex_partial', 'regex_exact', 'in'], operator: 'contains_any'},
                                        hotel : {name: 'Hotel', type: 'string', input: 'text', operators: ['exists', 'equals', 'any', 'substr', 'regex_partial', 'regex_exact', 'in'], operator: 'contains_any'},
                                        restaurant : {name: 'Restaurant', type: 'string', input: 'text', operators: ['exists', 'equals', 'any', 'substr', 'regex_partial', 'regex_exact', 'in'], operator: 'contains_any'},
                                        cause : {name: 'Cause', type: 'string', input: 'text', operators: ['exists', 'equals', 'any', 'substr', 'regex_partial', 'regex_exact', 'in'], operator: 'contains_any'},
                                        sports_league : {name: 'Sports League', type: 'string', input: 'text', operators: ['exists', 'equals', 'any', 'substr', 'regex_partial', 'regex_exact', 'in'], operator: 'contains_any'},
                                        sports_team : {name: 'Sports Team', type: 'string', input: 'text', operators: ['exists', 'equals', 'any', 'substr', 'regex_partial', 'regex_exact', 'in'], operator: 'contains_any'},
                                        band : {name: 'Band', type: 'string', input: 'text', operators: ['exists', 'equals', 'any', 'substr', 'regex_partial', 'regex_exact', 'in'], operator: 'contains_any'},
                                        government : {name: 'Government', type: 'string', input: 'text', operators: ['exists', 'equals', 'any', 'substr', 'regex_partial', 'regex_exact', 'in'], operator: 'contains_any'},
                                        non_profit : {name: 'Non Profit', type: 'string', input: 'text', operators: ['exists', 'equals', 'any', 'substr', 'regex_partial', 'regex_exact', 'in'], operator: 'contains_any'},
                                        school : {name: 'School', type: 'string', input: 'text', operators: ['exists', 'equals', 'any', 'substr', 'regex_partial', 'regex_exact', 'in'], operator: 'contains_any'},
                                        university : {name: 'University', type: 'string', input: 'text', operators: ['exists', 'equals', 'any', 'substr', 'regex_partial', 'regex_exact', 'in'], operator: 'contains_any'},
                                        actor : {name: 'Actor', type: 'string', input: 'text', operators: ['exists', 'equals', 'any', 'substr', 'regex_partial', 'regex_exact', 'in'], operator: 'contains_any'},
                                        athlete : {name: 'Athlete', type: 'string', input: 'text', operators: ['exists', 'equals', 'any', 'substr', 'regex_partial', 'regex_exact', 'in'], operator: 'contains_any'},
                                        author : {name: 'Author', type: 'string', input: 'text', operators: ['exists', 'equals', 'any', 'substr', 'regex_partial', 'regex_exact', 'in'], operator: 'contains_any'},
                                        director : {name: 'Director', type: 'string', input: 'text', operators: ['exists', 'equals', 'any', 'substr', 'regex_partial', 'regex_exact', 'in'], operator: 'contains_any'},
                                        musician : {name: 'Musician', type: 'string', input: 'text', operators: ['exists', 'equals', 'any', 'substr', 'regex_partial', 'regex_exact', 'in'], operator: 'contains_any'},
                                        politician : {name: 'Politician', type: 'string', input: 'text', operators: ['exists', 'equals', 'any', 'substr', 'regex_partial', 'regex_exact', 'in'], operator: 'contains_any'},
                                        public_figure : {name: 'Public Figure', type: 'string', input: 'text', operators: ['exists', 'equals', 'any', 'substr', 'regex_partial', 'regex_exact', 'in'], operator: 'contains_any'},
                                        city : {name: 'City', type: 'string', input: 'text', operators: ['exists', 'equals', 'any', 'substr', 'regex_partial', 'regex_exact', 'in'], operator: 'contains_any'},
                                        country : {name: 'Country', type: 'string', input: 'text', operators: ['exists', 'equals', 'any', 'substr', 'regex_partial', 'regex_exact', 'in'], operator: 'contains_any'},
                                        landmark : {name: 'Landmark', type: 'string', input: 'text', operators: ['exists', 'equals', 'any', 'substr', 'regex_partial', 'regex_exact', 'in'], operator: 'contains_any'},
                                        state_province : {name: 'State / Province', type: 'string', input: 'text', operators: ['exists', 'equals', 'any', 'substr', 'regex_partial', 'regex_exact', 'in'], operator: 'contains_any'},
                                        album : {name: 'Album', type: 'string', input: 'text', operators: ['exists', 'equals', 'any', 'substr', 'regex_partial', 'regex_exact', 'in'], operator: 'contains_any'},
                                        book : {name: 'Book', type: 'string', input: 'text', operators: ['exists', 'equals', 'any', 'substr', 'regex_partial', 'regex_exact', 'in'], operator: 'contains_any'},
                                        drink : {name: 'Drink', type: 'string', input: 'text', operators: ['exists', 'equals', 'any', 'substr', 'regex_partial', 'regex_exact', 'in'], operator: 'contains_any'},
                                        food : {name: 'Food', type: 'string', input: 'text', operators: ['exists', 'equals', 'any', 'substr', 'regex_partial', 'regex_exact', 'in'], operator: 'contains_any'},
                                        game : {name: 'Game', type: 'string', input: 'text', operators: ['exists', 'equals', 'any', 'substr', 'regex_partial', 'regex_exact', 'in'], operator: 'contains_any'},
                                        movie : {name: 'Movie', type: 'string', input: 'text', operators: ['exists', 'equals', 'any', 'substr', 'regex_partial', 'regex_exact', 'in'], operator: 'contains_any'},
                                        product : {name: 'Product', type: 'string', input: 'text', operators: ['exists', 'equals', 'any', 'substr', 'regex_partial', 'regex_exact', 'in'], operator: 'contains_any'},
                                        song : {name: 'Song', type: 'string', input: 'text', operators: ['exists', 'equals', 'any', 'substr', 'regex_partial', 'regex_exact', 'in'], operator: 'contains_any'},
                                        tv_show : {name: 'TV Show', type: 'string', input: 'text', operators: ['exists', 'equals', 'any', 'substr', 'regex_partial', 'regex_exact', 'in'], operator: 'contains_any'},
                                        blog : {name: 'Blog', type: 'string', input: 'text', operators: ['exists', 'equals', 'any', 'substr', 'regex_partial', 'regex_exact', 'in'], operator: 'contains_any'},
                                        website : {name: 'Website', type: 'string', input: 'text', operators: ['exists', 'equals', 'any', 'substr', 'regex_partial', 'regex_exact', 'in'], operator: 'contains_any'},
                                        article : {name: 'Article', type: 'string', input: 'text', operators: ['exists', 'equals', 'any', 'substr', 'regex_partial', 'regex_exact', 'in'], operator: 'contains_any'}
                                    }
                                },
                                twitter : {
                                    name : 'Twitter',
                                    fields : {
                                        card : {name: 'Card Type', type: 'string', input: 'select', single: true, options: {'summary':'Summary','photo':'Photo','player':'Player'}, operators: ['exists', 'equals'], operator: 'equals'},
                                        site : {name: 'Site Name (@username)', type: 'string', input: 'text', operators: ['equals', 'substr', 'contains_any', 'in', 'regex_partial', 'regex_exact'], operator: 'equals'},
                                        site_id : {name: 'Website\'s Twitter User ID', type: 'string', input: 'text', operators: ['substr', 'equals', 'regex_partial', 'regex_exact'], operator: 'equals'},
                                        creator : {name: '@username for the Content Creator / Author', type: 'string', input: 'text', operators: ['exists', 'equals', 'in', 'substr', 'different', 'regex_partial', 'regex_exact'], operator: 'equals'},
                                        creator_id : {name: 'Twitter ID of the Content Creator / Author', type: 'string', input: 'text', operators: ['substr', 'equals', 'regex_partial', 'regex_exact'], operator: 'equals'},
                                        url : {name: 'Canonical URL', type: 'string', input: 'text', operators: ['exists', 'equals', 'in', 'different', 'substr', 'regex_partial', 'regex_exact', 'contains_any'], operator: 'equals'},
                                        description : {name: 'Description', type: 'string', input: 'text', operators: ['exists', 'equals', 'contains_any', 'substr', 'contains_near', 'different', 'regex_partial', 'regex_exact'], operator: 'contains_any'},
                                        title : {name: 'Title', type: 'string', input: 'text', operators: ['exists', 'equals', 'contains_any', 'substr', 'contains_near', 'different', 'regex_partial', 'regex_exact'], operator: 'contains_any'},
                                        image : {name: 'Image URL', type: 'string', input: 'text', operators: ['exists', 'equals', 'in', 'different', 'substr', 'regex_partial', 'regex_exact', 'contains_any'], operator: 'equals'},
                                        image_width : {name: 'Image Width in Pixels', type: 'string', input: 'number', operators: ['exists', 'equals', 'different', 'greaterThan', 'lowerThan'], operator: 'lowerThan'},
                                        image_height : {name: 'Image Height in Pixels', type: 'string', input: 'number', operators: ['exists', 'equals', 'different', 'greaterThan', 'lowerThan'], operator: 'lowerThan'},
                                        player : {name: 'Player HTTPS URL', type: 'string', input: 'text', operators: ['exists', 'equals', 'in', 'different', 'substr', 'regex_partial', 'regex_exact', 'contains_any'], operator: 'equals'},
                                        player_width : {name: 'Player Width in Pixels', type: 'string', input: 'number', operators: ['exists', 'equals', 'different', 'greaterThan', 'lowerThan'], operator: 'lowerThan'},
                                        player_height : {name: 'Player Height in Pixels', type: 'string', input: 'number', operators: ['exists', 'equals', 'different', 'greaterThan', 'lowerThan'], operator: 'lowerThan'},
                                        player_stream : {name: 'Player Stream URL', type: 'string', input: 'text', operators: ['exists', 'equals', 'in', 'different', 'substr', 'regex_partial', 'regex_exact', 'contains_any'], operator: 'equals'},
                                        player_stream_content_type : {name: 'Player Stream Content Type', type: 'string', input: 'text', operators: ['exists', 'equals', 'in', 'different', 'substr', 'regex_partial', 'regex_exact', 'contains_any'], operator: 'equals'}
                                    }
                                }
                            }
                        }
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
                language : {
                    name : 'Language',
                    fields : {
                        tag : {name: 'Language', icon: 'language_name', type: 'string', input: 'select', optionsSet: 'language', operators: ['in'], operator: 'in'},
                        confidence : {name: 'Confidence', type: 'int', input: 'slider', min: 0, max: 100, 'default': 50, operators: ['equals', 'greaterThan', 'lowerThan']}
                    }
                },
                demographic : {
                    name : 'Demographics',
                    fields : {
                        twitter_activity : {name: 'Twitter Activity', type: 'string', input: 'select', single: true, options: {'> 5 tweets/day':'&gt 5 Tweets a Day','1-5 tweets/day':'1-5 Tweeks a Day','1-7 twts/week':'1-7 Tweets a Week','1-4 twts/month':'1-4 Tweets a Month','< 1 twt/month':'&lt; 1 Tweet a Month'}, operators: ['exists', 'equals']},
                        large_accounts_followed : {name: 'Large Accounts Followed', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact', 'in'], operator: 'in'},
                        'accounts-categories' : {name: 'Categories of Accounts Followed', icon: 'accounts_categories', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact', 'in'], operator: 'in'},
                        likes_and_interests : {name: 'Likes and Interests', icon: 'interests', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'regex_partial', 'regex_exact']},
                        'status-work': {name: 'Work Status', icon: 'work-status', type: 'string', input: 'select', single: true, options: {'Students':'Students','Unemployed':'Unemployed','Working':'Working','Retirees':'Retirees'}, operators: ['exists', 'equals']},
                        professions : {name: 'Professions', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact', 'in'], operator: 'in'},
                        services : {name: 'Services and Technologies', icon: 'services_and_technologies', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact', 'in'], operator: 'in'},
                        'main_street-dressed_by' : {name: 'Dressed By', icon: 'ms_clothes', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact', 'in'], operator: 'in'},
                        'main_street-shop_at' : {name: 'Shop At', icon: 'ms_shop', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact', 'in'], operator: 'in'},
                        'main_street-eat_and_drink_at' : {name: 'Eat and Drink At', icon: 'ms_food', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact', 'in'], operator: 'in'},
                        type : {name: 'Type', type: 'string', input: 'select', options: {'People':'People','Companies/orgs':'Companies / Organizations'}, operators: ['exists', 'equals']},
                        first_language : {name: 'First Language', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'regex_partial', 'regex_exact']},
                        'status-relationship': {name: 'Relationship Status', icon: 'relationship', type: 'string', input: 'select', single: true, options: {'Single':'Single','Engaged':'Engaged','Married':'Married','Parents':'Parents','Divorced':'Divorced'}, operators: ['exists', 'equals']},
                        sex: {name: 'Gender', type: 'string', input: 'select', single: true, options: {'male':'Male','female':'Female'}, operators: ['exists', 'equals']},
                        'age_range-start' : {name: 'Older Than', icon: 'older_than', type: 'int', input: 'slider', operators: ['exists', 'equals'], min: 0, max: 99, 'default': 25},
                        'age_range-end' : {name: 'Younger Than', icon: 'younger_than', type: 'int', input: 'slider', operators: ['exists', 'equals'], min: 0, max: 99, 'default': 25},
                        'location-country' : {name: 'Location by Country', icon: 'country', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
                        'location-us_state' : {name: 'Location by US State', icon: 'usa', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
                        'location-city' : {name: 'Location by City', icon: 'city', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']}
                    }
                },
                salience : {
                    name : 'Salience',
                    fields : {
                        content : {
                            name: 'Content',
                            fields : {
                                sentiment : {name: 'Sentiment', type: 'int', input: 'slider', operators: ['greaterThan', 'lowerThan'], min: -100, max: 100, 'default': 0},
                                topics : {name: 'Topics', type: 'string', input: 'select', operators: ['in'], optionsSet: 'salienceTopics'},
                                'entities-name' : {name: 'Entities Name', icon: 'entities_name', type: 'string', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'in', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
                                'entities-type' : {name: 'Entities Type', icon: 'entities_type', type: 'string', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'in', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']}
                            }
                        },
                        title : {
                            name: 'Title',
                            fields : {
                                sentiment : {name: 'Sentiment', type: 'int', input: 'slider', operators: ['greaterThan', 'lowerThan'], min: -100, max: 100, 'default': 0},
                                topics : {name: 'Topics', type: 'string', input: 'select', operators: ['in'], optionsSet: 'salienceTopics'},
                                'entities-name' : {name: 'Entities Name', icon: 'entities_name', type: 'string', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'in', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']},
                                'entities-type' : {name: 'Entities Type', icon: 'entities_type', type: 'string', type: 'string', input: 'text', cs: true, operators: ['exists', 'equals', 'in', 'substr', 'contains_any', 'contains_near', 'different', 'regex_partial', 'regex_exact']}
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
                language : {'af': 'Afrikaans', 'ar': 'Arabic', 'bg': 'Bulgarian', 'zh': 'Chinese', 'cs': 'Czech', 'da': 'Danish', 'nl': 'Dutch', 'en': 'English', 'et': 'Estonian', 'fi': 'Finnish', 'fr': 'French', 'de': 'German', 'el': 'Greek', 'he': 'Hebrew', 'hu': 'Hungarian', 'is': 'Icelandic', 'it': 'Italian', 'ja': 'Japanese', 'ko': 'Korean', 'la': 'Latin', 'lt': 'Lithuanian', 'lv': 'Latvian', 'no': 'Norwegian', 'pl': 'Polish', 'pt': 'Portuguese', 'ro': 'Romanian', 'ru': 'Russian', 'es': 'Spanish', 'sv': 'Swedish', 'tl': 'Tagalog'},
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
