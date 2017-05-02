const Twitter = require('node-tweet-stream')
const {ipcMain} = require('electron')
const apiConfig = require('../api.json')
require('string_score')
const HISTORY_MAX_LENGTH = 1000000

module.exports = (mainWindow) => {
  /**
   * Node Twitter Stream instance which allows tracking topics
   * @type {{
   *   on: function,
   *   track: function,
   *   untrack: function,
   *   tracking: function,
   * }}
   */
  const connection = new Twitter(apiConfig)

  /**
   * Array of tweets that have been sent to any client
   * This array will grow until HISTORY_MAX_LENGTH has been
   * reached to prevent duplicated information
   * @type {Array}
   */
  const tweetHashes = []

  /**
   * Next tweet to be sent to clients
   * This element is cached until a better tweet has been found
   * For "cache invalidation" we use the "nextTweetUsed" variable
   * @type {{
   *   text: string
   *   extended_entities: object|undefined
   * }|null}
   */
  let nextTweet = null

  /**
   * True when the current tweet has been sent to any client
   * Initially true because we do not have any content
   * @type {boolean}
   */
  let nextTweetUsed = true

  /**
   * Creates a hash of the given tweet performing some transformation
   * over it's data (the original tweet is not modified)
   * @param {object} tweet
   * @param {string} tweet.text
   * @returns {string} Generated hash
   */
  const getTweetHash = (tweet) => tweet.text
    .replace(/^RT @[a-z0-9_]+:?/gi, '')
    .replace(/(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?/gi, '')
    .replace(/\W+/gi, '')

  function hasTweetHash (hash) {
    if (tweetHashes.indexOf(hash) === -1) {
      return false
    }
    return tweetHashes.find((hashCandidate) => hash.score(hashCandidate, 1) > 0.5)
  }

  function addTweetHash (hash) {
    tweetHashes.push(hash)
  }

  function cleanTweetHashes () {
    tweetHashes.splice(0, tweetHashes.length / 2)
  }

  /**
   * Adds a new tweet as nextTweet
   * @param {object} tweet
   * @param {object} tweet.user
   * @param {number} tweet.user.friends_count
   * @param {string} tweet.source
   * @param {string} tweet.text
   * @param {object} [tweet.extended_entities]
   * @param {object} [tweet.entities]
   * @param {Array} [tweet.entities.media]
   */
  const addTweet = (tweet) => {
    // Standard twitter accounts have at least one common friend
    // It the friend list is totally empty this account is a potential
    // bot or spamer.
    if (tweet.user && !tweet.user.friends_count) {
      return
    }

    // There are some sources which allow automatic tweeting.
    // We do not want them on our stream
    const source = tweet.source
    if (
      source.indexOf('IFTTT') !== -1 ||
      source.indexOf('dlvr.it') !== -1 ||
      source.indexOf('Tweetbot') !== -1
    ) {
      return
    }

    // Using the string_score library we can check if two tweets are slightly
    // the same, and perform a merge process to avoid duplications
    const hash = getTweetHash(tweet)
    if (hasTweetHash(hash)) {
      return
    }

    // Finally we set the tweet as next candidate
    // We give preference to tweets with media content because they are more fancy
    if (tweet.extended_entities || (tweet.entities && tweet.entities.media)) {
      if (!nextTweet || nextTweetUsed || !nextTweet.extended_entities) {
        nextTweet = tweet
        nextTweetUsed = false
      } else if (tweet.extended_entities) {
        nextTweet = tweet
        nextTweetUsed = false
      }
    } else if (!nextTweet || nextTweetUsed) {
      nextTweet = tweet
      nextTweetUsed = false
    }
  }

  /**
   * Sends the nextTweet variable as response
   */
  const getNextTweet = () => {
    let returnedTweet = null
    if (nextTweet) {
      const tweetHash = getTweetHash(nextTweet)
      if (tweetHashes.indexOf(tweetHash) === -1) {
        addTweetHash(getTweetHash(nextTweet))
        console.log('Cached hashes:', tweetHashes.length)
        nextTweetUsed = true
        returnedTweet = nextTweet
      }
    }
    if (tweetHashes.length > HISTORY_MAX_LENGTH) {
      cleanTweetHashes()
    }
    return returnedTweet
  }

  connection.on('tweet', addTweet)

  ipcMain.on('get-tweet', () => {
    const tweet = getNextTweet()
    if (tweet) mainWindow.webContents.send('tweet', tweet)
  })

  ipcMain.on('update-topics', (event, topics) => {
    tweetHashes.length = 0
    nextTweetUsed = true
    nextTweet = null
    console.log('New topics:', topics.join(', '))
    connection.untrackAll()
    for (let topic of topics) {
      connection.track(topic)
    }
  })
}
