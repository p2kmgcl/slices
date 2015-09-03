DELAY = 10000
TWEET_INTERVAL = 5000
MEDIA_PRIORITY = 100

consumerKey = 'MY_AWESOME_CONSUMER_KEY'
consumerSecret = 'MY_AWESOME_CONSUMER_SECRET'
token = 'MY_COOL_TOKEN'
tokenSecret = 'MY_INCREDIBLY_GOLDEN_AWESOME_TOKEN_SECRET'

bearerToken = null
tweets = []

bird = new Codebird
bird.setConsumerKey consumerKey, consumerSecret
bird.setToken token, tokenSecret
bird.__call 'oauth2_token', {}, (reply) ->
    bearerToken = reply.access_token
    bird.setBearerToken bearerToken
    updateTweets()
    renderTweets()
    updateGrid()

updateTweets = ->
    langSelect = document.getElementById 'lang'
    params = # https://dev.twitter.com/rest/reference/get/search/tweets
        q: document.getElementById('topic').value
        lang: langSelect.options[langSelect.selectedIndex].value or ''
        result_type: 'mixed'
        count: 100
        include_entities: 'true'
        
    bird.__call 'search_tweets', params, (reply) ->
        if reply?.statuses?
            tweets = reply.statuses.sort (t1, t2) ->
                result = 0
                if t1.entities?.media? then result += MEDIA_PRIORITY
                if t2.entities?.media? then result -= MEDIA_PRIORITY
                result += t1.retweet_count - t2.retweet_count
                return result

        setTimeout updateTweets, DELAY

updateGrid = ->
    minigrid '.tweets', '.tweetWrap'
    requestAnimationFrame updateGrid

truncateLinks = (autolinker, match) -> return ''

renderTweets = ->
    if tweets.length > 0
        $currentTweets = document.querySelectorAll '.tweet'
        tweet = tweets.pop()
        tweetFound = false
        
        for $tweet in $currentTweets
            text = $tweet.dataset.text
            newText = Autolinker.link tweet.text, replaceFn: truncateLinks
            if text is newText
                tweetFound = true
                renderTweet tweet, $tweet.parentNode
                setTimeout renderTweets, TWEET_INTERVAL / 10
        
        if not tweetFound
            renderTweet tweet
            setTimeout renderTweets, TWEET_INTERVAL
        
    else setTimeout renderTweets, TWEET_INTERVAL / 10

renderTweet = (tweet, $wrapper) ->
    $tweets = document.getElementById 'tweets'
    $firstTweet = $tweets.querySelector '.tweetWrap'
    newWrapper = false
    
    if not $wrapper?
        $tweet = document.createElement 'div'
        $tweet.classList.add 'tweet'
        $tweet.style.backgroundColor = randomColor
            luminosity: 'light'
            hue: 'random'
        $wrapper = document.createElement 'div'
        $wrapper.classList.add 'tweetWrap'
        $wrapper.appendChild $tweet
        if $firstTweet then $tweets.insertBefore $wrapper, $firstTweet
        else $tweets.appendChild $wrapper
        newWrapper = true
    else
        $tweet = $wrapper.querySelector '.tweet'
        $tweet.innerHTML = ''

    $tweet.dataset.text = Autolinker.link tweet.text, replaceFn: truncateLinks
    $text = document.createElement 'div'
    $text.classList.add 'text'
    $text.innerHTML = Autolinker.link tweet.text
    $tweet.appendChild $text

    if tweet.entities?.media?
        image = tweet.entities.media[0]
        $image = document.createElement 'img'
        if newWrapper
            $image.style.opacity = 0
            $image.addEventListener 'load', ->
                me = @
                requestAnimationFrame -> me.style.opacity = 1
        $image.src = image.media_url
        $tweet.appendChild $image
