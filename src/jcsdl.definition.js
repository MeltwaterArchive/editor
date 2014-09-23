var JCSDLDefinition = (function() {
    'use strict';

    // define some privates
    var

    /**
     * Name of this definition object (for easy differentiation between instances)
     *
     * @type {String}
     */
    name = 'datasift',

    /**
     * List of all possible targets and their fields and their types.
     *
     * @type {Object}
     */
    targets = {
        // general interaction
        interaction : {
            name : 'All Data Sources',
            fields : {
                content : {name: 'Content', preset: 'string'},
                raw_content : {name: 'Raw Content', preset: 'string'},
                geo : {name: 'Location', preset: 'geo'},
                link : {name: 'Link', preset: 'url'},
                sample : {name: 'Sample', type: 'float', input: 'slider', operators: ['lowerThan'], displayFormat : function(v) { return v + '%';}},
                source : {name: 'Source', preset: 'string'},
                type : {name: 'Type', type: 'string', input: 'select', operators: ['in'], options: {'2ch':'2channel','amazon':'Amazon','blog':'Blog','board':'Board','dailymotion':'DailyMotion','facebook':'Facebook','flickr':'Flickr','imdb':'IMDb','reddit':'Reddit','topic':'Topix','twitter':'Twitter','video':'Videos','youtube':'YouTube'}},
                title : {name: 'Title', preset: 'string'},
                author : {
                    name: 'Author',
                    icon : 'user',
                    fields: {
                        id : {name: 'ID', icon: 'user-id', preset: 'int'},
                        avatar : {name: 'Avatar', type: 'string', cs: true, input: 'text', operators: ['exists']},
                        link : {name: 'Link', preset: 'url'},
                        name : {name: 'Name', icon: 'fullname', preset: 'string'},
                        username : {name: 'User Name', preset: 'string'}
                    }
                }
            }
        },

        // twitter
        twitter : {
            name : 'Twitter',
            fields : {
                domains : {name: 'Domains',  preset: 'string'},
                geo : {name: 'Location', preset: 'geo'},
                in_reply_to_screen_name : {name: 'In Reply To',  icon: 'inreply', preset: 'string'},
                links : {name: 'Links', icon: 'link', preset: 'url'},
                mentions : {name: 'Mentions',  preset: 'string'},
                mention_ids : {name: 'Mentions IDs', preset: 'intArray'},
                source : {name: 'Source',  preset: 'string'},
                status : {name: 'Status', preset: 'singleSelect', options: {'user_protect':'Private Account','user_unprotect':'Public Account','user_suspend':'Suspended Account','user_unsuspend':'Account Released from Suspension','user_delete':'Deleted Account','user_undelete':'Restored Account','user_withheld':'User Withheld','status_withheld':'Status Withheld'}},
                text : {name: 'Tweet', icon: 'tweet', preset: 'string'},
                user : {
                    name: 'User',
                    fields : {
                        description : {name: 'Description', icon: 'user-description', preset: 'string'},
                        followers_count : {name: 'Followers Count', preset: 'sliderRange', max : 50000, 'default' : 1000, step : 100},
                        follower_ratio : {name: 'Follower Ratio', preset: 'sliderRange', type: 'float', max : 10, step : 0.1, 'default' : 2},
                        friends_count : {name: 'Friends Count', preset: 'sliderRange', max : 50000, 'default' : 1000, step : 100},
                        id : {name: 'ID', icon: 'user-id', preset: 'intArray'},
                        lang : {name: 'Language', icon: 'language', type: 'string', input: 'select', optionsSet: 'language', operators: ['exists', 'in']},
                        listed_count : {name: 'Listed Count', preset: 'sliderRange', max : 1000, 'default' : 500},
                        location : {name: 'Location', preset: 'string'},
                        name : {name: 'Name', icon: 'username', preset: 'string'},
                        profile_age : {name: 'Age', icon: 'age', preset: 'sliderRangeEquals', min : 7, max : 100, 'default' : 21},
                        screen_name : {name: 'Screen Name',  preset: 'string'},
                        statuses_count : {name: 'Statuses Count', preset: 'sliderRange', max : 10000, 'default' : 50},
                        time_zone : {name: 'Time Zone',  preset: 'string'},
                        url : {name: 'URL', icon: 'url', preset: 'url'},
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
                                locality : {name: 'Locality', preset: 'string'},
                                region : {name: 'Region', preset: 'string'},
                                street_address : {name: 'Street Address', preset: 'string'}
                            }
                        },
                        country : {name: 'Country', preset: 'string'},
                        country_code : {name: 'Country Code', preset: 'string'},
                        full_name : {name: 'Full Name', icon: 'fullname', preset: 'string'},
                        name : {name: 'Name', icon: 'placename', preset: 'string'},
                        place_type : {name: 'Place Type', icon: 'type', preset: 'string'},
                        url : {name: 'URL', preset: 'url'}
                    }
                },
                retweet : {
                    name: 'Retweet',
                    fields : {
                        count : {name: 'No. of Retweets', preset: 'sliderRange', max : 10000, 'default' : 100},
                        domains : {name: 'Domains',  preset: 'string'},
                        elapsed : {name: 'Elapsed', preset: 'int'},
                        links : {name: 'Links', icon: 'link', preset: 'url'},
                        source : {name: 'Source',  preset: 'string'},
                        text : {name: 'Tweet', icon: 'tweet', preset: 'string'},
                        mentions : {name: 'Mentions',  preset: 'string'},
                        user : null // look at the bottom of the file
                    }
                },
                retweeted : {
                    name : 'Retweeted',
                    fields : {
                        id : {name: 'ID', preset: 'string'},
                        source : {name: 'Source',  preset: 'string'},
                        place : null, // look at the bottom of the file
                        user : null // look at the bottom of the file
                    }
                }
            }
        },

        // facebook
        facebook : {
            name : 'Facebook Public',
            fields : {
                application : {name: 'Application', preset: 'string'},
                caption : {name: 'Caption', preset: 'string'},
                'likes-names' : {name: 'Likes Names', preset: 'string'},
                link : {name: 'Link', preset: 'url'},
                message : {name: 'Message', preset: 'string'},
                hashtags : {name: 'Hashtags', preset: 'string', operators: ['exists', 'equals', 'regex_partial', 'regex_exact', 'in'], operator: 'in'},
                name : {name: 'Name', icon: 'fullname', preset: 'string'},
                og : {
                    name : 'Open Graph',
                    icon : 'opengraph',
                    fields : {
                        description : {name: 'Description', icon: 'description', preset: 'string'},
                        //length : {name: 'Length', icon: 'og-length', preset: 'string'},
                        photos : {name: 'Photos', icon: 'photos', preset: 'string'},
                        title : {name: 'Title', preset: 'string'},
                        type : {name: 'Type', preset: 'string'}
                    }
                },
                source : {name: 'Source',preset: 'string'},
                type : {name: 'Type', preset: 'string'}
            }
        },

        facebook_page : {
            name : 'Facebook Pages',
            fields : {
                'comment-id' : {name: 'Comment ID', preset: 'stringNumber'},
                'from-category' : {name: 'From Category', preset: 'string'},
                'from-id' : {name: 'From ID', preset: 'stringNumber'},
                'from-name' : {name: 'From Name', preset: 'string'},
                id : {name: 'Long Facebook ID', preset: 'stringNumber'},
                link : {name: 'Link', type: 'string', preset: 'url'},
                message : {name: 'Message', preset: 'string'},
                name : {name: 'Name', preset: 'string'},
                object_id : {name: 'Object ID', preset: 'stringNumber'},
                page : {
                    name : 'Page',
                    fields : {
                        category : {name: 'Category', icon: 'page_category', preset: 'string'},
                        id : {name: 'ID', icon: 'page_id', preset: 'stringNumber'},
                        link : {name: 'Link', icon: 'page_link', type: 'string', preset: 'url'},
                        name : {name: 'Name', icon: 'page_name', preset: 'string'},
                        username : {name: 'User Name', icon: 'page_username', preset: 'string'}
                    }
                },
                post : {
                    name : 'Post',
                    fields : {
                        id : {name: 'ID', icon: 'post_id', preset: 'stringNumber'},
                        content : {name: 'Content', icon: 'post_content', preset: 'string'},
                        link : {name: 'Link', icon: 'post_link', type: 'string', preset: 'url'},
                        type : {name: 'Type', icon: 'post_type', preset: 'string'}
                    }
                },
                type : {name: 'Type', preset: 'string'},
                story : {name: 'Story', preset: 'string'},
                picture : {name: 'Picture', preset: 'url'},
                source : {name: 'Source', preset: 'string'},
                'application-id' : {name: 'Applicaton ID', preset: 'stringNumber'},
                'application-name' : {name: 'Application Name', preset: 'string'}
            }
        },

        blog : {
            name : 'Blogs',
            fields : {
                author : {
                    name : 'Author',
                    icon : 'user',
                    fields : {
                        avatar : {name: 'Avatar', preset: 'string'},
                        link : {name: 'Author Link', preset: 'url'},
                        name : {name: 'Author Name', icon: 'author-name', preset: 'string'},
                        username : {name: 'User Name', preset: 'string'}
                    }
                },
                content : {name: 'Content', preset: 'string'},
                contenttype : {name: 'Content Type', preset: 'singleSelect', options: {'HTML':'html'}},
                domain : {name: 'Domain', preset: 'string'},
                link : {name: 'Link', preset: 'url'},
                post : {
                    name : 'Post',
                    fields : {
                        link : {name: 'Link', preset: 'url'},
                        title : {name: 'Title', preset: 'string'}
                    }
                },
                title : {name: 'Title', preset: 'string'},
                type : {name: 'Type', preset: 'singleSelect', options: {'thread':'Thread','post':'Post'}}
            }
        },

        board : {
            name : 'Boards',
            fields : {
                author : {
                    name : 'Author',
                    icon : 'user',
                    fields : {
                        age : {name: 'Age', preset: 'sliderRangeEquals', min : 7, max : 100, 'default' : 21},
                        avatar : {name: 'Avatar', preset: 'string'},
                        gender : {name: 'Gender', preset: 'string'},
                        link : {name: 'Author Link', preset: 'url'},
                        location : {name: 'Location', preset: 'string'},
                        name : {name: 'Author Name', icon: 'author-name', preset: 'string'},
                        registered : {name: 'Registered',  preset: 'string'},
                        signature : {name: 'Signature',  preset: 'string'},
                        username : {name: 'User Name', preset: 'string'}
                    }
                },
                content : {name: 'Content', preset: 'string'},
                contenttype : {name: 'Content Type', preset: 'singleSelect', options: {'HTML':'html'}},
                domain : {name: 'Domain', preset: 'string'},
                link : {name: 'Link', preset: 'url'},
                thread : {name: 'Thread', preset: 'string'},
                title : {name: 'Title', preset: 'string'},
                type : {name: 'Type', preset: 'singleSelect', options: {'thread':'Thread','post':'Post'}}
            }
        },

        dailymotion : {
            name : 'Dailymotion',
            fields : {
                author : {
                    name : 'Author',
                    icon : 'user',
                    fields : {
                        link : {name: 'Author Link', preset: 'url'},
                        username : {name: 'Author Name', icon: 'author-name', preset: 'string'}
                    }
                },
                category : {name: 'Category', preset: 'string'},
                content : {name: 'Content', preset: 'string'},
                contenttype : {name: 'Content Type', type: 'string', preset: 'singleSelect', options: {'HTML':'html'}},
                duration : {name: 'Duration', preset: 'sliderRangeEquals', min : 0, max : 10800, 'default' : 3600, displayFormat : function(v) {return v + 's';}},
                tags : {name: 'Tags', preset: 'string'},
                thumbnail : {name: 'Thumbnail', preset: 'string'},
                title : {name: 'Title', preset: 'string'},
                videolink : {name: 'Video Link', preset: 'url'}
            }
        },

        imdb : {
            name : 'IMDb',
            fields : {
                author : {
                    name : 'Author',
                    icon : 'user',
                    fields : {
                        link : {name: 'Author Link', preset: 'url'},
                        name : {name: 'Author Name', icon: 'author-name', preset: 'string'}
                    }
                },
                content : {name: 'Content', preset: 'string'},
                contenttype : {name: 'Content Type', preset: 'singleSelect', options: {'HTML':'html'}},
                link : {name: 'Link', preset: 'url'},
                thread : {name: 'Thread', preset: 'string'},
                title : {name: 'Title', preset: 'string'},
                type : {name: 'Type', preset: 'singleSelect', options: {'thread':'Thread','post':'Post'}}
            }
        },

        newscred : {
            name : 'NewsCred',
            fields : {
                article : {
                    name : 'Article',
                    fields : {
                        authors : {name: 'Authors', preset: 'string'},
                        category : {name: 'Category', preset: 'multiSelect', optionsSet: 'newscredCategories'},
                        title : {name: 'Title', preset: 'url'},
                        content : {name: 'Content', preset: 'string'},
                        fulltext : {name: 'Full Text', preset: 'string'},
                        domain : {name: 'Domain', preset: 'string'},
                        topics : {name: 'Topics', preset: 'string'}
                    }
                },
                image : {
                    name : 'Image',
                    fields : {
                        'attribution-link' : {name: 'Attribution Link', preset: 'url'},
                        'attribution-text' : {name: 'Attribution Text', preset: 'string'},
                        caption : {name: 'Caption', preset: 'string'}
                    }
                },
                source : {
                    name : 'Source',
                    fields : {
                        domain : {name: 'Source Domain', preset: 'string'},
                        link : {name: 'Link', type: 'string', preset: 'url'},
                        circulation : {name: 'Circulation', preset: 'string'},
                        name : {name: 'Name', icon: 'source_name', preset: 'string'},
                        company_type : {name: 'Company Type', preset: 'singleSelect', options: {'Private':'Private','Public':'Public','Cooperative':'Cooperative','Govt':'Government'}},
                        country : {name: 'Country', preset: 'string'},
                        founded : {name: 'Founded', type: 'string', input: 'number', operators: ['exists', 'equals', 'different']},
                        media_type : {name: 'Media Type', preset: 'singleSelect', options: {'blog':'Blog','mainstream':'Mainstream'}}
                    }
                },
                type : {name: 'Type', preset: 'singleSelect', options: {'article':'Article','video':'Video','image':'Image'}},
                video : {
                    name : 'Video',
                    fields : {
                        caption : {name: 'Caption', icon: 'video-caption', preset: 'string'},
                        category : {name: 'Category', preset: 'multiSelect', optionsSet: 'newscredCategories'},
                        domain : {name: 'Domain', preset: 'string'},
                        title : {name: 'Title', preset: 'string'},
                        topics : {name: 'Topics', preset: 'string'}
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
                        link : {name: 'Author Link', preset: 'url'},
                        name : {name: 'Author Name', icon: 'author-name', preset: 'string'}
                    }
                },
                content : {name: 'Content', preset: 'string'},
                contenttype : {name: 'Content Type', preset: 'singleSelect', options: {'HTML':'html'}},
                link : {name: 'Link', preset: 'url'},
                thread : {name: 'Thread', preset: 'string'},
                title : {name: 'Title', preset: 'string'},
                type : {name: 'Type', preset: 'singleSelect', options: {'thread':'Thread','post':'Post'}}
            }
        },

        topix : {
            name : 'Topix',
            fields : {
                author : {
                    name : 'Author',
                    icon : 'user',
                    fields : {
                        location : {name: 'Location', preset: 'string'},
                        name : {name: 'Author Name', icon: 'author-name', preset: 'string'}
                    }
                },
                content : {name: 'Content', preset: 'string'},
                contenttype : {name: 'Content Type', preset: 'singleSelect', options: {'HTML':'html'}},
                link : {name: 'Link', preset: 'url'},
                thread : {name: 'Thread', preset: 'string'},
                title : {name: 'Title', preset: 'string'},
                type : {name: 'Type', preset: 'singleSelect', options: {'thread':'Thread','post':'Post'}}
            }
        },

        video : {
            name : 'Videos',
            fields : {
                author : {
                    name : 'Author',
                    icon : 'user',
                    fields : {
                        avatar : {name: 'Avatar', preset: 'string'},
                        link : {name: 'Author Link', preset: 'url'},
                        name : {name: 'Author Name', icon: 'author-name', preset: 'string'},
                        username : {name: 'User Name', preset: 'string'}
                    }
                },
                category : {name: 'Category', preset: 'string'},
                commentslink : {name: 'Comments Link', preset: 'url'},
                content : {name: 'Content', preset: 'string'},
                contenttype : {name: 'Content Type', preset: 'singleSelect', options: {'HTML':'html'}},
                domain : {name: 'Domain', preset: 'string'},
                duration : {name: 'Duration', preset: 'sliderRangeEquals', min : 0, max : 10800, 'default' : 3600, displayFormat : function(v) {return v + 's';}},
                tags : {name: 'Tags', preset: 'string'},
                thumbnail : {name: 'Thumbnail', preset: 'string'},
                title : {name: 'Title', preset: 'string'},
                type : {name: 'Type', preset: 'singleSelect', options: {'video':'Video','comment':'Comment'}},
                videolink : {name: 'Video Link', preset: 'url'}
            }
        },

        youtube : {
            name : 'YouTube',
            fields : {
                author : {
                    name : 'Author',
                    icon : 'user',
                    fields : {
                        link : {name: 'Author Link', preset: 'url'},
                        name : {name: 'Author Name', icon: 'author-name', preset: 'string'}
                    }
                },
                category : {name: 'Category', preset: 'string'},
                commentslink : {name: 'Comments Link', preset: 'url'},
                content : {name: 'Content', preset: 'string'},
                duration : {name: 'Duration', preset: 'sliderRangeEquals', min : 0, max : 10800, 'default' : 3600, displayFormat : function(v) {return v + 's';}},
                tags : {name: 'Tags', preset: 'string'},
                thumbnail : {name: 'Thumbnail', preset: 'string'},
                title : {name: 'Title', preset: 'string'},
                type : {name: 'Type', type: 'string', preset: 'singleSelect', options: {'video':'Video','comment':'Comment'}},
                videolink : {name: 'Video Link', preset: 'url'}
            }
        },

        bitly : {
            name : 'Bitly',
            fields : {
                'user-agent' : {name: 'User Agent', icon: 'useragent', preset: 'string'},
                url_hash : {name: 'URL Hash', preset: 'string'},
                'share-hash' : {name: 'Share Hash', icon: 'share_hash', preset: 'string'},
                cname : {name: 'CName', preset: 'string'},
                referring_url : {name: 'Referring URL', icon: 'ref_url', preset: 'url'},
                referring_domain : {name: 'Referring Domain', icon: 'ref_domain', preset: 'string', operator: 'in'},
                url : {name: 'URL', preset: 'url'},
                domain : {name: 'Domain', preset: 'string', operator: 'in'},
                country : {name: 'Country', preset: 'string'},
                country_code : {name: 'Country Code', preset: 'string'},
                geo_region : {name: 'Geo Region', preset: 'string'},
                geo_region_code : {name: 'Geo Region Code', preset: 'string'},
                geo_city : {name: 'Geo City', icon: 'city', preset: 'string'},
                geo : {name: 'Geo', preset: 'geo'},
                timezone : {name: 'Timezone', preset: 'string'}
            }
        },

        wikipedia : {
            name : 'Wikipedia',
            fields : {
                author : {
                    name : 'Author',
                    icon : 'user',
                    fields : {
                        contributions : {name: 'Author Contributions Page', icon: 'contributions', preset: 'string'},
                        talk : {name: 'Author Talk Page', icon: 'talkpage', preset: 'string'}
                    }
                },
                changetype : {name: 'Change Type', preset: 'singleSelect', options: {'minor_edit':'Minor Edit','new_page':'New Page','bot_edit':'Automatic Edit'}},
                diff : {
                    name : 'Difference',
                    fields : {
                        'changes-added' : {name: 'Changes Added', icon: 'changeadded', preset: 'string'},
                        'changes-removed' : {name: 'Changes Removed', icon: 'changeremoved', preset: 'string'},
                        from : {name: 'From', icon: 'diff-from', preset: 'stringNumber'},
                        to : {name: 'To', icon: 'diff-to', preset: 'stringNumber'}
                    }
                },
                pageid : {name: 'Page ID', preset: 'int', operator: 'equals'},
                parentid : {name: 'Parent ID', preset: 'int', operator: 'equals'},
                title : {name: 'Title', preset: 'string'},
                externallinks : {name: 'External Links', preset: 'url'},
                images : {name: 'Images', icon: 'image', preset: 'url'},
                namespace : {name: 'Namespace', preset: 'singleSelect', options: {'Media':'Media','Special':'Special','Main':'Main','Talk':'Talk','User':'User','User talk':'User Talk','Project':'Project','Project talk':'Project Talk','File':'File talk','MediaWiki':'MediaWiki','MediaWiki talk':'MediaWiki Talk','Template':'Template','Template talk':'Template Talk','Help':'Help','Help talk':'Help Talk','Category':'Category','Category talk':'Category Talk'}},
                newlen : {name: 'New Length', icon: 'newlength', preset: 'sliderRangeEquals', min: 0, max: 10000, 'default': 1000},
                oldlen : {name: 'Old Length', icon: 'oldlength', preset: 'sliderRangeEquals', min: 0, max: 10000, 'default': 1000}
            }
        },

        tumblr : {
            name : 'Tumblr',
            fields : {
                activity : {name: 'Activity', icon: 'tumblractivity', preset: 'singleSelect', options: {'CreatePost':'Create Post', 'UpdatePost':'Update Post', 'DeletePost':'Delete Post', 'Likes':'Likes', 'Unlikes':'Unlikes'}},
                type : {name: 'Type', icon: 'tumblrtype', preset: 'singleSelect', options: {'photo':'Photo','video':'Video','audio':'Audio','text':'Text','chat':'Chat','quote':'Quote','answer':'Answer','link':'Link'}},
                state : {name: 'State', preset: 'singleSelect', options: {'published':'Published','queued':'Queued','draft':'Draft','private':'Private'}},
                'source-blogid' : {name: 'Source Blog ID', preset: 'stringNumber'},
                'dest-blogid' : {name: 'Destination Blog ID', preset: 'stringNumber'},
                'dest-postid' : {name: 'Destination Post ID', preset: 'stringNumber'},
                'root-blogid' : {name: 'Root Blog ID', preset: 'stringNumber'},
                'root-postid' : {name: 'Root Post ID', preset: 'stringNumber'},
                blogid : {name: 'Blog ID', preset: 'stringNumber'},
                blog_name : {name: 'Blog Name', preset: 'string'},
                title : {name: 'Title', icon: 'tumblrtitle', preset: 'string'},
                body : {name: 'Body', preset: 'string'},
                format : {name: 'Format', preset: 'singleSelect', options: {'html':'HTML','markdown':'Markdown'}},
                post_url : {name: 'Post URL', preset: 'url'},
                slug : {name: 'URL Slug', preset: 'string'},
                text : {name: 'Quote Text', preset: 'string'},
                source_html : {name: 'Quote HTML Source', preset: 'string'},
                source_url : {name: 'Source URL', preset: 'url'},
                source_title : {name: 'Source Title', preset: 'string'},
                tags : {name: 'Tags', preset: 'string'},
                note_count : {name: 'Note Count', preset: 'sliderRange', min: 0, max: 10000, 'default': 50},
                question : {name: 'Question', preset: 'string'},
                answer : {name: 'Answer', preset: 'string'},
                asking_name : {name: 'Asking Name', preset: 'string'},
                asking_url : {name: 'Asking URL', preset: 'url'},
                video_url : {name: 'Video URL', preset: 'url'},
                duration : {name: 'Video Duration', preset: 'stringNumber'},
                artist : {name: 'Artist', preset: 'string'},
                track_name : {name: 'Track Name', preset: 'string'},
                album : {name: 'Track Album', preset: 'string'},
                plays : {name: 'Track Plays', preset: 'sliderRangeEquals', min: 0, max: 10000, 'default': 50},
                audio_url : {name: 'Track URL', preset: 'url'},
                link : {name: 'Photo Link', preset: 'url'},
                description : {name: 'Link Description', preset: 'string'},
                caption : {name: 'Caption', preset: 'string'},
                meta : {
                    name : 'Meta',
                    fields : {
                        url : {name: 'URL', preset: 'url'},
                        type : {name: 'Type', preset: 'singleSelect', options: {'photo':'Photo','video':'Video','audio':'Audio','text':'Text','chat':'Chat','quote':'Quote','answer':'Answer','link':'Link'}},
                        description : {name: 'Description', preset: 'string'},
                        likes_local : {name: 'Local Likes', preset: 'sliderRangeEquals', min: 0, max: 10000, 'default': 50},
                        likes_global : {name: 'Global Likes', preset: 'sliderRangeEquals', min: 0, max: 10000, 'default': 50},
                        reblogged_global : {name: 'Reblogged', preset: 'sliderRangeEquals', min: 0, max: 10000, 'default': 50}
                    }
                },
                reblogged : {
                    name : 'Reblogged',
                    fields : {
                        'from-id' : {name: 'From ID', preset: 'stringNumber'},
                        'from-url' : {name: 'From URL', preset: 'string'},
                        'from-name' : {name: 'From Name', preset: 'string'},
                        'from-title' : {name: 'From Title', preset: 'string'},
                        'root-id' : {name: 'Root ID', preset: 'stringNumber'},
                        'root-url' : {name: 'Root URL', preset: 'url'},
                        'root-name' : {name: 'Root Name', preset: 'string'},
                        'root-title' : {name: 'Root Title', preset: 'string'}
                    }
                }
            }
        },

        googleplus : {
            name : 'Google+',
            fields : {
                url : {name: 'URL', preset: 'url'},
                type : {name: 'Type', preset: 'singleSelect', options: {'activity':'Activity','comment':'Comment','plusone':'+1'}},
                verb : {name: 'Verb', preset: 'string'},
                title : {name: 'Title', preset: 'string'},
                'actor-id' : {name: 'Author ID', input: 'text', operators: ['exists', 'equals', 'different']},
                'actor-display_name' : {name: 'Author Name', preset: 'string'},
                'actor-url': {name: 'URL', preset: 'url'},
                'object' : {
                    name : 'Object',
                    fields : {
                        object_type : {name: 'Object Type', icon: 'type', preset: 'string'},
                        content : {name: 'Content', preset: 'string'},
                        url : {name: 'URL', preset: 'url'},
                        attachments : {
                            name : 'Attachments',
                            icon : 'attachment',
                            fields : {
                                object_type : {name: 'Type', icon: 'type', preset: 'string'},
                                display_name : {name: 'Display Name', icon: 'name', preset: 'string'},
                                content : {name: 'Content', preset: 'string'},
                                url : {name: 'URL', preset: 'url'}
                            }
                        }
                    }
                },
                'in_reply_to-id' : {name: 'In Reply To: ID', preset: 'stringNumber'},
                'in_reply_to-url' : {name: 'In Reply To: URL', preset: 'url'},
                provider_title : {name: 'Provider Title', preset: 'string'}
            }
        },

        instagram : {
            name : 'Instagram',
            fields : {
                type : {name: 'Type', preset: 'singleSelect', options: {'image':'Image','video':'Video','comment':'Comment','like':'Like'}},
                tags : {name: 'Tags', preset: 'string'},
                filter : {name: 'Filter', preset: 'string'},
                link : {name: 'Link', icon: 'url', preset: 'url'},
                images : {
                    name : 'Images',
                    icon : 'image',
                    fields : {
                        low_resolution : {
                            name : 'Low Resolution',
                            fields : {
                                url : {name: 'URL', preset: 'url'},
                                width : {name: 'Width', preset: 'sliderRangeEquals', min: 0, max: 1024, 'default': 640},
                                height : {name: 'Height', preset: 'sliderRangeEquals', min: 0, max: 1024, 'default': 640}
                            }
                        },
                        thumbnail : {
                            name : 'Thumbnail',
                            fields : {
                                url : {name: 'URL', preset: 'url'},
                                width : {name: 'Width', preset: 'sliderRangeEquals', min: 0, max: 1024, 'default': 640},
                                height : {name: 'Height', preset: 'sliderRangeEquals', min: 0, max: 1024, 'default': 640}
                            }
                        },
                        standard_resolution : {
                            name : 'Standard Resolution',
                            fields : {
                                url : {name: 'URL', preset: 'url'},
                                width : {name: 'Width', preset: 'sliderRangeEquals', min: 0, max: 1024, 'default': 640},
                                height : {name: 'Height', preset: 'sliderRangeEquals', min: 0, max: 1024, 'default': 640}
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
                                url : {name: 'URL', preset: 'url'},
                                width : {name: 'Width', preset: 'sliderRangeEquals', min: 0, max: 1024, 'default': 640},
                                height : {name: 'Height', preset: 'sliderRangeEquals', min: 0, max: 1024, 'default': 640}
                            }
                        },
                        standard_resolution : {
                            name : 'Standard Resolution',
                            fields : {
                                url : {name: 'URL', preset: 'url'},
                                width : {name: 'Width', preset: 'sliderRangeEquals', min: 0, max: 1024, 'default': 640},
                                height : {name: 'Height', preset: 'sliderRangeEquals', min: 0, max: 1024, 'default': 640}
                            }
                        }
                    }
                },
                caption : {
                    name : 'Caption',
                    fields : {
                        text : {name: 'Text', preset: 'string'},
                        'from-id' : {name: 'From ID', preset: 'stringNumber'},
                        'from-username' : {name: 'From Username', icon: 'username', preset: 'string'},
                        'from-full_name' : {name: 'From Full Name', icon: 'fullname', preset: 'string'}
                    }
                },
                from : {
                    name : 'From',
                    fields : {
                        id : {name: 'ID', preset: 'stringNumber'},
                        username : {name: 'Username', preset: 'string'},
                        full_name : {name: 'Full Name', icon: 'fullname', preset: 'string'},
                        bio : {name: 'Bio', preset: 'string'},
                    }
                },
                'location-id' : {name: 'Location ID', preset: 'stringNumber'},
                'location-name' : {name: 'Location Name', preset: 'string'},
                users_in_photo : {
                    name: 'Users in Photo',
                    fields : {
                        id : {name: 'ID', preset: 'stringNumber'},
                        full_name : {name: 'Full Name', icon: 'fullname', preset: 'string'},
                        username : {name: 'Username', preset: 'string'},
                    }
                },
                'attribution-name' : {name: 'Attribution Name', preset: 'string'},
                'attribution-website' : {name: 'Attribution Website', preset: 'url'},
                text : {name: 'Text', preset: 'string'},
                media : {
                    name : 'Media',
                    fields : {
                        caption : {name: 'Caption', preset: 'string'},
                        tags : {name: 'Tags', preset: 'string'},
                        type : {name: 'Type', preset: 'string'},
                        link : {name: 'Link', preset: 'url'},
                        id : {name: 'ID', preset: 'stringNumber'},
                        username : {name: 'Username', preset: 'string'}
                    }
                },
                geo : {name: 'Geo', preset: 'geo'}
            }
        },

        yammer : {
            name : 'Yammer',
            fields : {
                type : {name: 'Type', preset: 'string'},
                message_type : {name: 'Message Type', preset: 'string'},
                direct_message : {name: 'Direct Message', type: 'int', input: 'select', operators: ['exists', 'equals'], options: {'0':'0','1':'1'}},
                url : {name: 'URL', preset: 'url'},
                privacy : {name: 'Privacy', preset: 'singleSelect', options: {'private':'Private','public':'Public'}},
                sender_type : {name: 'Sender Type', preset: 'singleSelect', options: {'user':'User','system':'System'}},
                web_url : {name: 'Web Url', preset: 'url'},
                client_type : {name: 'Client Type', preset: 'string'},
                content_excerpt : {name: 'Content Excerpt', preset: 'string'},
                body : {
                    name : 'Body',
                    fields : {
                        rich : {name: 'Rich Body', preset: 'string'},
                        parsed : {name: 'Parsed Body', preset: 'string'},
                        plain : {name: 'Plain Body', preset: 'string'}
                    }
                },
                thread : {
                    name : 'Thread',
                    fields : {
                        'stats-shares' : {name: 'Shares Stats', icon: 'shares', preset: 'sliderRangeEquals', min: 0, max: 10000, 'default': 500},
                        'stats-updates' : {name: 'Updates Stats', icon: 'updates', preset: 'sliderRangeEquals', min: 0, max: 10000, 'default': 500},
                        direct_message : {name: 'Direct Message', type: 'int', input: 'select', operators: ['exists', 'equals'], options: {'0':'0','1':'1'}},
                        id : {name: 'ID', type: 'int', input: 'text', operators: ['exists', 'equals']},
                        url : {name: 'URL', preset: 'url'},
                        privacy : {name: 'Privacy', preset: 'singleSelect', options: {'private':'Private','public':'Public'}},
                        web_url : {name: 'Web Url', preset: 'url'},
                    }
                },
                group : {
                    name : 'Group',
                    fields : {
                        name : {name: 'Name', preset: 'string'},
                        id : {name: 'ID', type: 'int', input: 'text', operators: ['exists', 'equals', 'different', 'in']},
                        office365_url : {name: 'Office 365 URL', preset: 'url'},
                        url : {name: 'URL', preset: 'url'},
                        description : {name: 'Description', preset: 'string'},
                        privacy : {name: 'Privacy', preset: 'singleSelect', options: {'private':'Private','public':'Public'}},
                        web_url : {name: 'Web Url', preset: 'url'},
                        full_name : {name: 'Full Name', icon: 'fullname', preset: 'string'},
                        'stats-followers' : {name: 'Followers Stats', icon: 'followers', preset: 'sliderRangeEquals', min: 0, max: 10000, 'default': 500},
                        'stats-following' : {name: 'Following Stats', icon: 'following', preset: 'sliderRangeEquals', min: 0, max: 10000, 'default': 500},
                        'stats-updates' : {name: 'Updates Stats', icon: 'updates', preset: 'sliderRangeEquals', min: 0, max: 10000, 'default': 500}
                    }
                },
                sender : {
                    name : 'Sender',
                    fields : {
                        job_title : {name: 'Job Title', preset: 'string'},
                        name : {name: 'Name', preset: 'string'},
                        id : {name: 'ID', type: 'int', input: 'text', operators: ['exists', 'equals', 'different', 'in']},
                        url : {name: 'URL', preset: 'url'},
                        type : {name: 'Type', preset: 'singleSelect', options: {'user':'User','system':'System'}},
                        web_url : {name: 'Web Url', preset: 'url'},
                        full_name : {name: 'Full Name', icon: 'fullname', preset: 'string'}
                    }
                }
            }
        },

        wordpress : {
            name : 'WordPress',
            fields : {
                article : {
                    name : 'Article',
                    fields : {
                        author : {
                            name : 'Author',
                            fields : {
                                id : {name: 'Author ID', icon: 'user-id', preset: 'stringNumber'},
                                link : {name: 'Author Link', preset: 'url'},
                                username : {name: 'Author Username', preset: 'string'}
                            }
                        },
                        blog_id : {name: 'Blog ID', icon: 'blogid', preset: 'stringNumber'},
                        comment_count : {name: 'Comment Count', icon: 'comments-count', preset: 'sliderRange', min: 0, max: 1000},
                        id : {name: 'ID', preset: 'stringNumber'},
                        lang : {name: 'Language', icon: 'language', preset: 'multiSelect', optionsSet: 'language'},
                        link : {name: 'Link', preset: 'url'},
                        post_id : {name: 'Post ID', preset: 'stringNumber'},
                        summary : {name: 'Summary', icon: 'description', preset: 'string'},
                        title : {name: 'Title', preset: 'string'}
                    }
                },
                author : {
                    name : 'Author',
                    fields : {
                        id : {name: 'Author ID', icon: 'user-id', preset: 'stringNumber'},
                        link : {name: 'Author Link', preset: 'url'},
                        username : {name: 'Author Username', preset: 'string'}
                    }
                },
                content : {name: 'Content', preset: 'string'},
                tags : {name: 'Tags', preset: 'string'},
                categories : {name: 'Categories', icon: 'category', preset: 'string'},
                inreplyto : {name: 'In Reply To', icon: 'inreply', preset: 'string'},
                link : {name: 'Link', preset: 'url'},
                permalink : {name: 'Permalink', preset: 'url'},
                title : {name: 'Title', preset: 'string'},
                type : {name: 'Type', preset: 'singleSelect', options: {'comment':'Comment','post':'Post','like':'Like'}},
                blog : {
                    name : 'Blog',
                    fields : {
                        name : {name: 'Name', preset: 'string'},
                        link : {name: 'Link', preset: 'url'},
                        id : {name: 'ID', preset: 'stringNumber'},
                        lang : {name: 'Language', icon: 'language', preset: 'multiSelect', optionsSet: 'language'},
                        summary : {name: 'Summary', icon: 'description', preset: 'string'}
                    }
                }
            }
        },

        intensedebate : {
            name : 'IntenseDebate',
            fields : {
                author : {
                    name : 'Author',
                    fields : {
                        username : {name: 'Username', preset: 'string'},
                        link : {name: 'Link', preset: 'url'}
                    }
                },
                title : {name: 'Title', preset: 'string'},
                type : {name: 'Type', preset: 'singleSelect', options: {'vote-up':'Vote Up','vote-down':'Vote Down','comment':'Comment'}},
                article : {
                    name : 'Article',
                    fields : {
                        id : {name: 'ID', preset: 'stringNumber'},
                        title : {name: 'Title', preset: 'string'},
                        link : {name: 'Author Link', preset: 'url'}
                    }
                },
                content : {name: 'content', preset: 'string'}
            }
        },

        lexisnexis : {
            name : 'LexisNexis',
            fields : {
                article : {
                    name : 'Article',
                    fields : {
                        byline : {name: 'Byline', preset: 'string'},
                        content : {name: 'Content', preset: 'string'},
                        length : {name: 'Length', preset: 'int'},
                        title : {name: 'Title', preset: 'string'},
                        type : {name: 'Type', preset: 'singleSelect', options: {'Magazine':'Magazine','Newspaper':'Newspaper','Newswire':'Newswire','Other (Journal)':'Other (Journal)','Other (Periodical)':'Other (Periodical)','Overige (Tijdschriftartikel)':'Overige (Tijdschriftartikel)','Transcript':'Transcript','Web Blog':'Web Blog','Web Publication':'Web Publication'}}
                    }
                },
                'docinfo-lnlni' : {name: 'Docinfo Lnlni', preset: 'string'},
                feedtype : {name: 'Feedtype', preset: 'singleSelect', options: {'industry':'Industry','international':'International','us':'US'}},
                indexing : {
                    name : 'Indexing',
                    fields : {
                        'city-item-term' : {name: 'City', preset: 'string', icon: 'city'},
                        'company-item-term' : {name: 'Company', preset: 'string', icon: 'company'},
                        'country-item-term' : {name: 'Country', preset: 'string', icon: 'country'},
                        'industry-item-term' : {name: 'Industry', preset: 'string', icon: 'industry'},
                        'organization-item-term' : {name: 'Organization', preset: 'string', icon: 'organization'},
                        'state-item-term' : {name: 'State', preset: 'string', icon: 'state'},
                        'subject-item-term' : {name: 'Subject', preset: 'string', icon: 'subject'},
                        'ticker-item-term' : {name: 'Ticker', preset: 'string', icon: 'ticker'}
                    }
                },
                language : {name: 'Language', preset: 'singleSelect', options: {'da':'Danish','de':'German','en':'English','fr':'French','it':'Italian','ms':'Malay','nl':'Dutch','pl':'Polish','ru':'Russian'}},
                links : {name: 'Links', preset: 'string'},
                'load-date': {name: 'Load Date', preset: 'string'},
                'source-name': {name: 'Source Name', preset: 'string', icon: 'source'}
            }
        },

        sinaweibo : {
            name : 'Sina Weibo',
            fields : {
                'annotations-photos-caption': {name: 'Annotations Photos Caption', preset: 'string', icon: 'photos-caption'},
                'annotations-place-geo': {name: 'Annotations Place Geo', preset: 'string', icon: 'place-geo'},
                author : {
                    name : 'Author',
                    fields : {
                        'city-name': {name: 'City', preset: 'string', icon: 'city'},
                        displayname : {name: 'Display Name', preset: 'string'},
                        favourites_count : {name: 'Favourites Count', preset: 'sliderRange', icon: 'favourites-count'},
                        followers_count : {name: 'Followers Count', preset: 'sliderRange'},
                        following : {name: 'Following', preset: 'sliderRange'},
                        friends_count : {name: 'Friends Count', preset: 'sliderRange'},
                        gender : {name: 'Gender', preset: 'singleSelect', options: {'m':'Male','f':'Female'}},
                        id : {name: 'ID', preset: 'string'},
                        link : {name: 'Link', preset: 'string'},
                        'province-name': {name: 'Province', preset: 'string', icon: 'province'},
                        screen_name : {name: 'Screen Name', preset: 'string'},
                        statuses_count : {name: 'Statuses Count', preset: 'sliderRange'},
                        verified : {name: 'Verified', preset: 'singleSelect', options: {'true':'True'}, icon: 'user_verified'}
                    }
                },
                geo : {name: 'Geo', preset: 'geo'},
                id : {name: 'ID', preset: 'string'},
                language : {name: 'Language', preset: 'singleSelect', options: {'zh-cn':'Chinese','zh-tw':'Chinese - Taiwan','en':'English','de':'German','ja':'Japanese','vi':'Vietnamese','cs':'Czech','nl':'Dutch','fil':'Filipino','ro':'Romanian'}},
                link : {name: 'Link', preset: 'string'},
                original_pic : {name: 'Original Picture', preset: 'string', icon: 'original-pic'},
                parent_reblog : {name: 'Parent Reblog', preset: 'string', icon: 'parent-reblog'},
                reblogged : {
                    name : 'Reblogged',
                    fields : {
                        'annotations-place-geo': {name: 'Annotations Place Geo', preset: 'string', icon: 'place-geo'},
                        author : {
                            name : 'Author',
                            fields : {
                                id : {name: 'ID', preset: 'string'},
                                link : {name: 'Link', preset: 'string'}
                            }
                        },
                        geo : {name: 'Geo', preset: 'geo'},
                        id : {name: 'ID', preset: 'string'},
                        language : {name: 'Language', preset: 'singleSelect', options: {'zh-cn':'Chinese','zh-tw':'Chinese - Taiwan','en':'English','de':'German','ja':'Japanese','vi':'Vietnamese','cs':'Czech','nl':'Dutch','fil':'Filipino','ro':'Romanian'}},
                        link : {name: 'Link', preset: 'string'},
                        original_pic : {name: 'Original Picture', preset: 'string', icon: 'original-pic'},
                        source : {name: 'Source', preset: 'string'}
                    }
                },
                reply : {
                    name : 'Reply',
                    fields : {
                        author : {
                            name : 'Author',
                            fields : {
                                id : {name: 'ID', preset: 'string'},
                                link : {name: 'Link', preset: 'string'}
                            }
                        },
                        language : {name: 'Language', preset: 'singleSelect', options: {'zh-cn':'Chinese','zh-tw':'Chinese - Taiwan','en':'English','de':'German','ja':'Japanese','vi':'Vietnamese','cs':'Czech','nl':'Dutch','fil':'Filipino','ro':'Romanian'}},
                        link : {name: 'Link', preset: 'string'},
                        source : {name: 'Source', preset: 'string'},
                        text : {name: 'Text', preset: 'string', icon: 'content'}
                    }
                },
                source : {name: 'Source', preset: 'string'},
                status : {
                    name : 'Status',
                    fields : {
                        'annotations-photos-caption': {name: 'Annotations Photos Caption', preset: 'string', icon: 'photos-caption'},
                        'annotations-place-geo': {name: 'Annotations Place Geo', preset: 'string', icon: 'place-geo'},
                        author : {
                            name : 'Author',
                            fields : {
                                favourites_count : {name: 'Favourites Count', preset: 'sliderRange', icon: 'favourites-count'},
                                followers_count : {name: 'Followers Count', preset: 'sliderRange'},
                                friends_count : {name: 'Friends Count', preset: 'sliderRange'},
                                id : {name: 'ID', preset: 'string'},
                                link : {name: 'Link', preset: 'string'},
                                statuses_count : {name: 'Statuses Count', preset: 'sliderRange'},
                                verified : {name: 'Verified', preset: 'singleSelect', options: {'true':'True'}, icon: 'user_verified'}
                            }
                        },
                        geo : {name: 'Geo', preset: 'geo'},
                        id : {name: 'ID', preset: 'string'},
                        language : {name: 'Language', preset: 'singleSelect', options: {'zh-cn':'Chinese','zh-tw':'Chinese - Taiwan','en':'English','de':'German','ja':'Japanese','vi':'Vietnamese','cs':'Czech','nl':'Dutch','fil':'Filipino','ro':'Romanian'}},
                        link : {name: 'Link', preset: 'string'},
                        parent_reblog : {name: 'Parent Reblog', preset: 'string', icon: 'parent-reblog'},
                        source : {name: 'Source', preset: 'string'}
                    }
                },
                text : {name: 'Text', preset: 'string', icon: 'content'},
                type : {name: 'Type', preset: 'singleSelect', options: {'status':'Status','comment':'Comment'}}
            }
        },

        tencentweibo : {
            name : 'Tencent Weibo',
            fields : {
                author : {
                    name : 'Author',
                    fields : {
                        displayname : {name: 'Display Name', preset: 'string'},
                        followers_count : {name: 'Followers Count', preset: 'sliderRange'},
                        following_count : {name: 'Following', preset: 'sliderRange', icon: 'following'},
                        id : {name: 'ID', preset: 'string'},
                        link : {name: 'Link', preset: 'string'},
                        statuses_count : {name: 'Statuses Count', preset: 'sliderRange'},
                        verified : {name: 'Verified', preset: 'singleSelect', options: {'true':'True'}, icon: 'user_verified'}
                    }
                },
                image_url : {name: 'Image URL', preset: 'string', icon: 'image'},
                lang : {name: 'Language', preset: 'singleSelect', icon: 'language', options: {'zh-cn':'Chinese','zh-tw':'Chinese - Taiwan','en':'English','vi':'Vietnamese','in':'India','fil':'Filipino','ja':'Japanese','pt':'Portuguese','cy':'Welsh','ms':'Malay'}},
                link : {name: 'Link', preset: 'string'},
                origin_url : {name: 'Origin URL', preset: 'string', icon: 'origin-url'},
                post_id : {name: 'Post ID', preset: 'string'},
                text : {name: 'Text', preset: 'string', icon: 'content'},
                thread_id : {name: 'Thread ID', preset: 'string', icon: 'thread'},
                thread_url : {name: 'Thread URL', preset: 'string', icon: 'thread-url'},
                type : {name: 'Type', preset: 'singleSelect', options: {'post':'Post','repost':'Repost','reply':'Reply'}}
            }
        },

        jive : {
            name : 'Jive',
            fields : {
                'actor-url' : {name: 'Actor URL', preset: 'url'},
                'actor-display_name' : {name: 'Actor Display Name', preset: 'string'},
                'object' : {
                    name : 'Object',
                    fields : {
                        url : {name: 'URL', preset: 'url'},
                        object_type : {name: 'Object Type', preset: 'string', icon: 'type'},
                        display_name : {name: 'Display Name', preset: 'string', icon: 'displayname'},
                        summary : {name: 'Summary', preset: 'string'}
                    }
                },
                target : {
                    name : 'Target',
                    fields : {
                        url : {name: 'URL', preset: 'url'},
                        object_type : {name: 'Object Type', preset: 'string', icon: 'type'},
                        display_name : {name: 'Display Name', preset: 'string', icon: 'displayname'}
                    }
                },
                content : {name: 'Content', preset: 'string'},
                title : {name: 'Title', preset: 'string'},
                type : {name: 'Type', preset: 'string'},
                url : {name: 'URL', preset: 'url'},
                verb : {name: 'Verb', preset: 'string'}
            }
        },

        augmentation : {
            name : 'Augmentations',
            fields : {
                klout : {
                    name : 'Klout',
                    fields : {
                        amplification : {name: 'Amplification', preset: 'sliderRangeEquals', min: 0, max: 100, 'default': 50},
                        network : {name: 'Network Effect', preset: 'sliderRangeEquals', min: 0, max: 100, 'default': 50},
                        score : {name: 'Score', preset: 'sliderRangeEquals', min: 0, max: 100, 'default': 50},
                        topics : {name: 'Topics', icon: 'topic', preset: 'string'},
                        true_reach : {name: 'True Reach', preset: 'sliderRangeEquals', min: 0, max: 100000, 'default': 1000}
                    }
                },
                links : {
                    name : 'Links',
                    fields : {
                        title : {name: 'Title', preset: 'string'},
                        domain : {name: 'Domain', preset: 'string', operator: 'equals'},
                        url : {name: 'URL', preset: 'url'},
                        normalized_url : {name: 'Normalized URL', preset: 'url'},
                        hops : {name: 'Hops', preset: 'stringNumber', operator: 'equals'},
                        code : {name: 'HTTP Code', icon: 'http_code', type: 'int', input: 'select', single: false, options: {'200':'200 OK','202':'202 Accepted','204':'204 No Content','300':'300 Multiple Choices','301':'301 Moved Permanently','302':'302 Found','303':'303 See Other','304':'304 Not Modified','307':'Temporary Redirect','400':'400 Bad Request','401':'401 Unauthorized','403':'403 Forbidden','404':'404 Not Found','405':'405 Method Not Allowed','406':'406 Not Acceptable','408':'408 Request Timeout','500':'500 Internal Server Error','502':'502 Bad Gateway','503':'503 Service Unavailable'}, operators: ['exists', 'equals', 'different', 'in'], operator: 'equals'},
                        meta : {
                            name : 'Meta',
                            icon : 'metatags',
                            fields : {
                                content_type : {name: 'Content Type', icon: 'contenttype', preset: 'string', operator: 'equals'},
                                charset : {name: 'Charset', preset: 'string', operator: 'in'},
                                lang : {name: 'Language', icon: 'language', preset: 'string', operator: 'equals'},
                                keywords : {name: 'Keywords', type: 'string', preset: 'string'},
                                description : {name: 'Description', preset: 'string'},
                                newskeywords : {name: 'Google News Keywords', preset: 'string'},
                                standout : {name: 'Google News Standout Link', preset: 'string'},
                                opengraph : {
                                    name : 'Open Graph',
                                    fields : {
                                        type : {name: 'Object Type', preset: 'string', operator: 'in'},
                                        title : {name: 'Object Title', preset: 'string', operator: 'in'},
                                        image : {name: 'Object Image URL', preset: 'url'},
                                        url : {name: 'Object Canonical URL', preset: 'url'},
                                        description : {name: 'Description', preset: 'string'},
                                        site_name : {name: 'Site Name', preset: 'string'},
                                        email : {name: 'Email', preset: 'string', operator: 'equals'},
                                        phone_number : {name: 'Phone Number',preset: 'string', operator: 'equals'},
                                        fax_number : {name: 'Fax Number', preset: 'string', operator: 'equals'},
                                        street_address : {name: 'Street Address', preset: 'string', operator: 'equals'},
                                        locality : {name: 'Locality', preset: 'string', operator: 'equals'},
                                        region : {name: 'Region', preset: 'string', operator: 'equals'},
                                        postal_code : {name: 'Postal Code', preset: 'string'},
                                        activity : {name: 'Activity', preset: 'string'},
                                        sport : {name: 'Sport', preset: 'string'},
                                        bar : {name: 'Bar', preset: 'string'},
                                        company : {name: 'Company', preset: 'string'},
                                        cafe : {name: 'Cafe', preset: 'string'},
                                        hotel : {name: 'Hotel', preset: 'string'},
                                        restaurant : {name: 'Restaurant', preset: 'string'},
                                        cause : {name: 'Cause', preset: 'string'},
                                        sports_league : {name: 'Sports League', preset: 'string'},
                                        sports_team : {name: 'Sports Team', preset: 'string'},
                                        band : {name: 'Band', preset: 'string'},
                                        government : {name: 'Government', preset: 'string'},
                                        non_profit : {name: 'Non Profit', preset: 'string'},
                                        school : {name: 'School', preset: 'string'},
                                        university : {name: 'University', preset: 'string'},
                                        actor : {name: 'Actor', preset: 'string'},
                                        athlete : {name: 'Athlete', preset: 'string'},
                                        author : {name: 'Author', preset: 'string'},
                                        director : {name: 'Director', preset: 'string'},
                                        musician : {name: 'Musician', preset: 'string'},
                                        politician : {name: 'Politician', preset: 'string'},
                                        public_figure : {name: 'Public Figure', preset: 'string'},
                                        city : {name: 'City', preset: 'string'},
                                        country : {name: 'Country', preset: 'string'},
                                        landmark : {name: 'Landmark', preset: 'string'},
                                        state_province : {name: 'State / Province', preset: 'string'},
                                        album : {name: 'Album', preset: 'string'},
                                        book : {name: 'Book', preset: 'string'},
                                        drink : {name: 'Drink', preset: 'string'},
                                        food : {name: 'Food', preset: 'string'},
                                        game : {name: 'Game', preset: 'string'},
                                        movie : {name: 'Movie', preset: 'string'},
                                        product : {name: 'Product', preset: 'string'},
                                        song : {name: 'Song', preset: 'string'},
                                        tv_show : {name: 'TV Show', preset: 'string'},
                                        blog : {name: 'Blog', preset: 'string'},
                                        website : {name: 'Website', preset: 'url'},
                                        article : {name: 'Article', preset: 'string'}
                                    }
                                },
                                twitter : {
                                    name : 'Twitter',
                                    fields : {
                                        card : {name: 'Card Type', preset: 'singleSelect', options: {'summary':'Summary','photo':'Photo','player':'Player'}},
                                        site : {name: 'Site Name (@username)', preset: 'string', operator: 'equals'},
                                        site_id : {name: 'Website\'s Twitter User ID', preset: 'stringNumber', operator: 'equals'},
                                        creator : {name: '@username for the Content Creator / Author', preset: 'stringNumber', operator: 'equals'},
                                        creator_id : {name: 'Twitter ID of the Content Creator / Author', preset: 'stringNumber', operator: 'equals'},
                                        url : {name: 'Canonical URL', preset: 'url'},
                                        description : {name: 'Description', preset: 'string'},
                                        title : {name: 'Title', preset: 'string'},
                                        image : {name: 'Image URL', preset: 'url'},
                                        image_width : {name: 'Image Width in Pixels', preset: 'stringNumber', operator: 'lowerThan'},
                                        image_height : {name: 'Image Height in Pixels', preset: 'stringNumber', operator: 'lowerThan'},
                                        player : {name: 'Player HTTPS URL', preset: 'url'},
                                        player_width : {name: 'Player Width in Pixels', preset: 'stringNumber', operator: 'lowerThan'},
                                        player_height : {name: 'Player Height in Pixels', preset: 'stringNumber', operator: 'lowerThan'},
                                        player_stream : {name: 'Player Stream URL', preset: 'url'},
                                        player_stream_content_type : {name: 'Player Stream Content Type', preset: 'string', operator: 'equals'}
                                    }
                                }
                            }
                        }
                    }
                },
                trends : {
                    name : 'Trends',
                    fields : {
                        type : {name: 'Type', preset: 'string', operator: 'equals'},
                        content : {name: 'Content', preset: 'string'},
                        source : {name: 'Source', preset: 'singleSelect', options: {'twitter':'Twitter'}}
                    }
                },
                language : {
                    name : 'Language',
                    fields : {
                        tag : {name: 'Language', icon: 'language_name', type: 'string', input: 'select', optionsSet: 'language', operators: ['in'], operator: 'in'},
                        confidence : {name: 'Confidence', preset: 'sliderRangeEquals', min: 0, max: 100, 'default': 50}
                    }
                },
                demographic : {
                    name : 'Demographics',
                    fields : {
                        twitter_activity : {name: 'Twitter Activity', preset: 'singleSelect', options: {'> 5 tweets/day':'&gt 5 Tweets a Day','1-5 tweets/day':'1-5 Tweeks a Day','1-7 twts/week':'1-7 Tweets a Week','1-4 twts/month':'1-4 Tweets a Month','< 1 twt/month':'&lt; 1 Tweet a Month'}},
                        large_accounts_followed : {name: 'Large Accounts Followed', preset: 'string', operator: 'in'},
                        'accounts-categories' : {name: 'Categories of Accounts Followed', icon: 'accounts_categories', preset: 'string', operator: 'in'},
                        likes_and_interests : {name: 'Likes and Interests', icon: 'interests', preset: 'string'},
                        'status-work': {name: 'Work Status', icon: 'work-status', preset: 'singleSelect', options: {'Students':'Students','Unemployed':'Unemployed','Working':'Working','Retirees':'Retirees'}},
                        professions : {name: 'Professions', type: 'string', preset: 'string', operator: 'in'},
                        services : {name: 'Services and Technologies', icon: 'services_and_technologies', preset: 'string', operator: 'in'},
                        'main_street-dressed_by' : {name: 'Dressed By', icon: 'ms_clothes', preset: 'string', operator: 'in'},
                        'main_street-shop_at' : {name: 'Shop At', icon: 'ms_shop', preset: 'string', operator: 'in'},
                        'main_street-eat_and_drink_at' : {name: 'Eat and Drink At', icon: 'ms_food', preset: 'string', operator: 'in'},
                        type : {name: 'Type', type: 'string', input: 'select', options: {'People':'People','Companies/orgs':'Companies / Organizations'}, operators: ['exists', 'equals']},
                        first_language : {name: 'First Language', preset: 'string'},
                        'status-relationship': {name: 'Relationship Status', icon: 'relationship', preset: 'singleSelect', options: {'Single':'Single','Engaged':'Engaged','Married':'Married','Parents':'Parents','Divorced':'Divorced'}},
                        sex: {name: 'Gender', preset: 'singleSelect', options: {'male':'Male','female':'Female'}},
                        'age_range-start' : {name: 'Older Than', icon: 'older_than', type: 'int', input: 'slider', operators: ['exists', 'equals'], min: 0, max: 99, 'default': 25},
                        'age_range-end' : {name: 'Younger Than', icon: 'younger_than', type: 'int', input: 'slider', operators: ['exists', 'equals'], min: 0, max: 99, 'default': 25},
                        'location-country' : {name: 'Location by Country', icon: 'country', preset: 'string'},
                        'location-us_state' : {name: 'Location by US State', icon: 'usa', preset: 'string'},
                        'location-city' : {name: 'Location by City', icon: 'city', preset: 'string'}
                    }
                },
                salience : {
                    name : 'Salience',
                    fields : {
                        content : {
                            name: 'Content',
                            fields : {
                                sentiment : {name: 'Sentiment', preset: 'sliderRange', min: -100, max: 100, 'default': 0},
                                topics : {name: 'Topics', type: 'string', input: 'select', operators: ['in'], optionsSet: 'salienceTopics'},
                                'entities-name' : {name: 'Entities Name', icon: 'entities_name', preset: 'string'},
                                'entities-type' : {name: 'Entities Type', icon: 'entities_type', preset: 'string'}
                            }
                        },
                        title : {
                            name: 'Title',
                            fields : {
                                sentiment : {name: 'Sentiment', preset: 'sliderRange', min: -100, max: 100, 'default': 0},
                                topics : {name: 'Topics', type: 'string', input: 'select', operators: ['in'], optionsSet: 'salienceTopics'},
                                'entities-name' : {name: 'Entities Name', icon: 'entities_name', preset: 'string'},
                                'entities-type' : {name: 'Entities Type', icon: 'entities_type', preset: 'string'}
                            }
                        }
                    }
                }
            }
        }

    },

    /**
     * Target configuration presets.
     *
     * @type {Object}
     */
    presets = {
        'string' : {
            type: 'string',
            cs: true,
            input: 'text',
            operators: ['exists', 'equals', 'substr', 'contains_any', 'all', 'wildcard', 'contains_near', 'different', 'regex_partial', 'regex_exact', 'in'],
            operator: 'contains_any'
        },
        'url' : {
            type: 'string',
            input: 'text',
            operators: ['exists', 'equals', 'substr', 'url_in', 'contains_any', 'all', 'wildcard', 'contains_near', 'different', 'regex_partial', 'regex_exact'],
            operator: 'url_in'
        },
        'singleSelect' : {
            type: 'string',
            input: 'select',
            single: true,
            operators: ['exists', 'equals', 'different']
        },
        'multiSelect' : {
            type: 'string',
            input: 'select',
            operators: ['exists', 'equals', 'different', 'in'],
            operator: 'in'
        },
        'geo' : {
            type: 'geo',
            input: ['geo_box', 'geo_radius', 'geo_polygon'],
            operators: ['exists', 'geo_box', 'geo_radius', 'geo_polygon']
        },
        'int' : {
            type: 'int',
            input: 'number',
            operators: ['exists', 'equals', 'different', 'greaterThan', 'lowerThan']
        },
        'intArray' : {
            type: 'int',
            input: 'number',
            operators: ['exists', 'equals', 'different', 'in'],
            operator: 'in'
        },
        'stringNumber' : {
            type: 'string',
            input: 'text',
            operators: ['exists', 'equals', 'different', 'in']
        },
        'sliderRange' : {
            type: 'int',
            input: 'slider',
            operators: ['greaterThan', 'lowerThan']
        },
        'sliderRangeEquals' : {
            type: 'int',
            input : 'slider',
            operators: ['equals', 'greaterThan', 'lowerThan']
        }
    },

    /**
     * Definition of CSDL operators.
     *
     * @type {Object}
     */
    operators = {
        substr : {
            label : 'Substring',
            description : 'Filter for a sequence of characters that form a word or part of a word.',
            code : 'substr',
            jsonp : 'https://dev.datasift.com/tooltip-endpoint/tooltip/retrieve?callback=jcsdlJSONP&id=substr'
        },
        all : {
            label : 'Contains All',
            description : 'Filter for all strings in the list of strings.',
            code : 'contains_all',
            jsonp : 'https://dev.datasift.com/tooltip-endpoint/tooltip/retrieve?callback=jcsdlJSONP&id=contains_all'
        },
        contains_any : {
            label : 'Contains words',
            description : 'Filter for one or more string values from a list of strings.',
            code : 'contains_any',
            jsonp : 'https://dev.datasift.com/tooltip-endpoint/tooltip/retrieve?callback=jcsdlJSONP&id=contains_any'
        },
        contains_near : {
            label : 'Contains words near',
            description : 'Filter for two or more words that occur near to each other.',
            code : 'contains_near',
            jsonp : 'https://dev.datasift.com/tooltip-endpoint/tooltip/retrieve?callback=jcsdlJSONP&id=contains_near'
        },
        wildcard : {
            label : 'Wildcard',
            description : 'Filter for strings using a wildcard character *.',
            code : 'wildcard',
            jsonp : 'https://dev.datasift.com/tooltip-endpoint/tooltip/retrieve?callback=jcsdlJSONP&id=wildcard'
        },
        different : {
            label : 'Different',
            description : 'Not equal to...',
            code : '!=',
            jsonp : 'https://dev.datasift.com/tooltip-endpoint/tooltip/retrieve?callback=jcsdlJSONP&id=equals-and-not-equals'
        },
        equals : {
            label : 'Equals',
            description : 'Equal to...',
            code : '==',
            jsonp : 'https://dev.datasift.com/tooltip-endpoint/tooltip/retrieve?callback=jcsdlJSONP&id=equals-and-not-equals'
        },
        'in' : {
            label : 'In',
            description : 'Filter for one or more values from a list.',
            code : 'in',
            jsonp : 'https://dev.datasift.com/tooltip-endpoint/tooltip/retrieve?callback=jcsdlJSONP&id=in'
        },
        url_in : {
            label : 'URL In',
            description : 'Filter for an exact match with a normalized URL.',
            code : 'url_in',
            jsonp : 'https://dev.datasift.com/tooltip-endpoint/tooltip/retrieve?callback=jcsdlJSONP&id=url_in'
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
            jsonp : 'https://dev.datasift.com/tooltip-endpoint/tooltip/retrieve?callback=jcsdlJSONP&id=exists'
        },
        regex_partial : {
            label : 'Partial Regex',
            description : 'Filter for content by a regular expression that matches any part of the target.',
            code : 'regex_partial',
            jsonp : 'https://dev.datasift.com/tooltip-endpoint/tooltip/retrieve?callback=jcsdlJSONP&id=regex_partial'
        },
        regex_exact : {
            label : 'Exact Regex',
            description : 'Filter for content by a regular expression that matches the entire target.',
            code : 'regex_exact',
            jsonp : 'https://dev.datasift.com/tooltip-endpoint/tooltip/retrieve?callback=jcsdlJSONP&id=regex_exact'
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

    /**
     * URL pattern for target help API.
     *
     * @type {String}
     */
    targetHelpJsonpSource = 'https://dev.datasift.com/tooltip-endpoint/tooltip/retrieve?callback=jcsdlJSONP&id={target}',

    /**
     * Definition of JCSDL VQB input types.
     *
     * @type {Object}
     */
    inputs = {
        text : {
            // list of operators for which the input field is a "tag" input field
            arrayOperators : ['contains_any', 'all', 'contains_near', 'all', 'in'],
            operator : 'contains_any'
        },
        number : {
            arrayOperators : ['in'],
            operator : 'equals'
        },
        select : {
            operator : 'in',
            sets : {
                language : {'af': 'Afrikaans', 'ar': 'Arabic', 'bg': 'Bulgarian', 'zh': 'Chinese', 'cs': 'Czech', 'da': 'Danish', 'nl': 'Dutch', 'en': 'English', 'et': 'Estonian', 'fi': 'Finnish', 'fr': 'French', 'de': 'German', 'el': 'Greek', 'he': 'Hebrew', 'hu': 'Hungarian', 'is': 'Icelandic', 'it': 'Italian', 'ja': 'Japanese', 'ko': 'Korean', 'la': 'Latin', 'lt': 'Lithuanian', 'lv': 'Latvian', 'no': 'Norwegian', 'pl': 'Polish', 'pt': 'Portuguese', 'ro': 'Romanian', 'ru': 'Russian', 'es': 'Spanish', 'sv': 'Swedish', 'tl': 'Tagalog', 'tr': 'Turkish'},
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
    },

    /**
     * The final definition object that is returned.
     *
     * @type {Object}
     */
    definition = {
        name : name,
        targets : {},
        operators : operators,
        targetHelpJsonpSource : targetHelpJsonpSource,
        inputs : inputs
    },

    /**
     * Merge two or more objects together.
     *
     * The rightmost argument has the top priority.
     *
     * @return {Object}
     */
    merge = function() {
        var result = {};

        for (var i in arguments) {
            if (arguments.hasOwnProperty(i)) {
                if (typeof arguments[i] !== 'object') {
                    continue;
                }

                for (var key in arguments[i]) {
                    if (arguments[i].hasOwnProperty(key)) {
                        result[key] = arguments[i][key];
                    }
                }
            }
        }

        return result;
    },

    /**
     * Applies presets defined on target and its subfields and returns it.
     *
     * @param  {Object} target A target definition.
     * @return {Object}
     */
    parseTargetDefinition = function(target) {
        // some targets are null as they should copy from other targets (see bottom of the file)
        if (target === null) {
            return target;
        }

        // if target has subfields then iterate over them and parse them
        if (target.hasOwnProperty('fields')) {
            for (var name in target.fields) {
                if (target.fields.hasOwnProperty(name)) {
                    target.fields[name] = parseTargetDefinition(target.fields[name]);
                }
            }

        // if its a "real" target then apply a preset on it
        } else {
            // but only if it has a preset of course
            if (target.hasOwnProperty('preset')) {
                if (!presets.hasOwnProperty(target.preset)) {
                    throw new Error('Undefined preset "' + target.preset + '" used.');
                }

                target = merge(presets[target.preset], target);
            }
        }

        return target;
    };

    // go through all targets and apply presets on them
    for (var source in targets) {
        if (targets.hasOwnProperty(source)) {
            definition.targets[source] = parseTargetDefinition(targets[source]);
        }
    }

    // and finally copy some targets to others, as they're identical
    definition.targets.twitter.fields.retweet.fields.user = definition.targets.twitter.fields.user;
    definition.targets.twitter.fields.retweeted.fields.place = definition.targets.twitter.fields.place;
    definition.targets.twitter.fields.retweeted.fields.user = definition.targets.twitter.fields.user;


    return definition;

})();