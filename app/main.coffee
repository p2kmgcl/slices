# Config

DELAY          = 10000
TWEET_INTERVAL = 5000
MEDIA_PRIORITY = 100
CLEAN_INTERVAL = 10000
MAX_TWEETS     = 10

# Real app
bird = null
bearerToken = null
tweets = []

cleanTweets = ->
    $tweets = document.getElementById 'tweets'
    $wraps = $tweets.querySelectorAll '.tweetWrap'
    CLEAN_INTERVAL = (parseFloat document.getElementById('cleanInterval').value, 10) * 1000
    MAX_TWEETS = (parseInt document.getElementById('maxTweets').value, 10)
    
    while $wraps.length > MAX_TWEETS
        $wraps = $tweets.querySelectorAll '.tweetWrap'
        $tweets.removeChild $wraps[$wraps.length - 1]
    setTimeout cleanTweets, CLEAN_INTERVAL

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
        $text = document.createElement 'text'
        $text.classList.add 'text'
        $tweet.appendChild $text
        $wrapper = document.createElement 'div'
        $wrapper.classList.add 'tweetWrap'
        $wrapper.appendChild $tweet
        if $firstTweet then $tweets.insertBefore $wrapper, $firstTweet
        else $tweets.appendChild $wrapper
        newWrapper = true
    else
        $tweet = $wrapper.querySelector '.tweet'
        $text = $tweet.querySelector '.text'

    $tweet.dataset.text = Autolinker.link tweet.text, replaceFn: -> ''
    $text.innerHTML = Autolinker.link tweet.text

    # Add media if necesary (or remove if not)
    $image = $tweet.querySelector '.image'
    if tweet.entities?.media?
        if $image is null
            $image = document.createElement 'img'
            $image.classList.add 'image'
            $tweet.appendChild $image
            $image.style.opacity = 0
            $image.addEventListener 'load', ->
                me = @
                requestAnimationFrame -> me.style.opacity = 1
            $image.src = tweet.entities.media[0].media_url
    else if $image? then $tweet.removeChild $image

renderTweets = ->
    TWEET_INTERVAL = (parseFloat document.getElementById('tweetInterval').value, 10) * 1000

    if tweets.length > 0
        $currentTweets = document.querySelectorAll '.tweet'
        tweet = tweets.pop()
        tweetFound = false
        
        # Filter retweets
        if tweet.text.substr(0, 3) is 'RT '
            tweet.text = tweet.text.substr (tweet.text.indexOf(':') + 2)

        for $tweet in $currentTweets
            text = $tweet.dataset.text
            newText = Autolinker.link tweet.text, replaceFn: -> ''
            if text is newText
                tweetFound = true
                renderTweet tweet, $tweet.parentNode
                requestAnimationFrame renderTweets
        
        if not tweetFound
            renderTweet tweet
            setTimeout renderTweets, TWEET_INTERVAL
        
    else requestAnimationFrame renderTweets

updateAPIKeys = ->
    keys = [
        'consumerKey'
        'consumerSecret'
        'token'
        'tokenSecret'
    ]
    
    for key in keys
        localValue = localStorage.getItem key
        $domElement = document.getElementById key
        if $domElement.value is '' then $domElement.value = localValue
        else localStorage.setItem key, $domElement.value

updateGrid = ->
    minigrid '.tweets', '.tweetWrap'
    requestAnimationFrame updateGrid

updateTweets = ->
    MEDIA_PRIORITY = parseFloat document.getElementById('mediaPriority').value, 10
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

# Begin

init = ->
    updateAPIKeys()
    consumerKey    = localStorage.getItem 'consumerKey'
    consumerSecret = localStorage.getItem 'consumerSecret'
    token          = localStorage.getItem 'token'
    tokenSecret    = localStorage.getItem 'tokenSecret'
    
    if consumerKey? and consumerSecret? and token? and tokenSecret?
        bird = new Codebird
        bird.setConsumerKey consumerKey, consumerSecret
        bird.setToken token, tokenSecret
        bird.__call 'oauth2_token', {}, (reply) ->
            bearerToken = reply.access_token
            bird.setBearerToken bearerToken
            cleanTweets()
            updateTweets()
            renderTweets()
            updateGrid()
    else setTimeout init, 300

document.getElementById('showConfig').addEventListener 'click', ->
    if document.getElementById('config').style.display is 'block'
        document.getElementById('config').style.display = 'none'
    else document.getElementById('config').style.display = 'block'
        
document.getElementById('closeConfig').addEventListener 'click', ->
    document.getElementById('config').style.display = 'none'

init()
