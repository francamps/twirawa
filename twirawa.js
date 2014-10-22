/*
*   RANDOM TWITTER WALK
*   By Franc Camps-Febrer, October 2014
*   Uses and extends functions by https://github.com/istrategylabs/node-twitter
*/

/**
*   Some varibales
*/ 

var Twitter =   require("node-twitter"),
    creds   =   require("./config.json"),
    fs      =   require("fs");

    myTwitterScreenName = "francamps",
    frequency = 120000,

    twitRest = new Twitter.RestClient(
    	creds.consumer_key,
    	creds.consumer_secret,
    	creds.access_token,
    	creds.access_secret
    );

/**
*   Replace accounts I follow with accounts they follow
*/ 
function replaceTimelineWithRandomness () {
    
    // Find accounts I follow
    twitRest.followingIds({ screen_name: "francamps"}, function (error, result) {
        handleRequestErr(error);

        if (result) {
            var userId = getRandomUser(result);

            // Unfollow account of userID
            twitRest.destroyFollowingIds({ user_id: userId }, function (error, result) {
                handleRequestErr(error);

                if (result) {
                    console.log("User " + userId + " unfollowed");
                    logUnfollowed(userId)

                    // Follow a random friend of the unfollowed account
                    followRandomFriend(userId);
                }
            });
        }
    });
}

/**
*   Get a random user of the list of ids
*
*   @param friends Result of Twitter.RestClient.followindIds
*/
function getRandomUser (friends) {
    var randomIndex = Math.floor(Math.random() * friends.ids.length),
    return friends.ids[randomIndex];    
}

/**
*   Follow a random friend of a given userId
*
*   @param userID Id of twitter user to find a random friend for
*/ 
function followRandomFriend (userID) {
    twitRest.followingIds({ user_id: userID }, function (error, result) {
        handleRequestErr(error);
        if (result) {
            var userId = getRandomUser(result);
    
            // Follow account
            twitRest.createFollowingIds({ user_id: userId }, function (error, result) {
                handleRequestErr(error);

                if (result) {
                    console.log("User " + userId + " followed");
                }
            });
        }
    });
}

/**
*   Print error if it happens
*
*   @param error Error object for twitter GET/POST request
*/
function handleRequestErr (error) {
    if (error) {
        console.log('Error: ' + (error.code ? error.code + ' ' + error.message : error.message));
    }    
}

/**
*   Log account id when unfollowed
*
*   @param unfollowed Id of account just unfollowed
*/
function logUnfollowed (unfollowed) {
	fs.appendFile('unfollowed.txt', "\n" + unfollowed, function (err) {
        if (err) throw err;
        console.log('The "data to append" was appended to file.');
	});
}



/**
*   Extend some utilitiy function for node-twitter,
*   especially for following / unfollowing
*/
function extendRestClientToUnfollow () {
    /**
     * Returns an array of numeric IDs for every user followed by the specified user.
     *
     * For information on acceptable parameters see the official <a href="https://dev.twitter.com/rest/reference/get/friends/ids">Twitter documenation</a>.
     *
     * @this {RestClient}
     * @param parameters
     * @param callback The callback function.
     */
    Twitter.RestClient.prototype.followingIds = function(parameters, callback)
    {
        var screenName = parameters['screen_name'];
        var userId = parameters['user_id'];
        if (screenName === undefined && userId === undefined)
        {
            throw new Error('Missing required parameter: screen_name or user_id.');
        }

        this._validator.validateScreenName(parameters);
        this._validator.validateUserId(parameters);

        // To work around JavaScript's inability to handle large numbers 
        // indicate IDs should be returned as strings
        parameters['stringify_ids'] = true;

        this._createGetRequest('friends/ids', this._format, parameters, callback);
    }

    /**
     * Allows an authenticated user to destroy the friendship with specific user ID
     * That is, it unfollows a specific user ID
     *
     * For information on acceptable parameters see the official <a href="https://dev.twitter.com/rest/reference/get/friendships/create">Twitter documenation</a>.
     *
     * @this {RestClient}
     * @param parameters
     * @param callback The callback function.
     */
    Twitter.RestClient.prototype.createFollowingIds = function(parameters, callback)
    {
        var screenName = parameters['screen_name'];
        var userId = parameters['user_id'];
        if (screenName === undefined && userId === undefined)
        {
            throw new Error('Missing required parameter: screen_name or user_id.');
        }

        this._validator.validateScreenName(parameters);
        this._validator.validateUserId(parameters);

        // To work around JavaScript's inability to handle large numbers 
        // indicate IDs should be returned as strings
        parameters['stringify_ids'] = true;

        this._createPostRequest('friendships/create', this._format, parameters, callback);
    }    

    /**
     * Allows an authenticated user to destroy the friendship with specific user ID
     * That is, it unfollows a specific user ID
     *
     * For information on acceptable parameters see the official <a href="https://dev.twitter.com/rest/reference/get/friends/ids">Twitter documenation</a>.
     *
     * @this {RestClient}
     * @param parameters
     * @param callback The callback function.
     */
    Twitter.RestClient.prototype.destroyFollowingIds = function(parameters, callback)
    {
        var screenName = parameters['screen_name'];
        var userId = parameters['user_id'];
        if (screenName === undefined && userId === undefined)
        {
            throw new Error('Missing required parameter: screen_name or user_id.');
        }

        this._validator.validateScreenName(parameters);
        this._validator.validateUserId(parameters);

        // To work around JavaScript's inability to handle large numbers 
        // indicate IDs should be returned as strings
        parameters['stringify_ids'] = true;

        this._createPostRequest('friendships/destroy', this._format, parameters, callback);
    }    
}

extendRestClientToUnfollow();

setInterval(replaceTimelineWithRandomness, frequency)