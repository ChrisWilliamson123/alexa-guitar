const audioEvents = [
  "AudioPlayer.PlaybackStopped",
  "AudioPlayer.PlaybackStarted",
  "AudioPlayer.PlaybackFinished",
  "AudioPlayer.PlaybackNearlyFinished",
  "AudioPlayer.PlaybackFailed"
];

const audioEventHandler = {
  canHandle({ requestEnvelope: { request } }) {
    return audioEvents.indexOf(request.type) > -1;
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder.getResponse();
  }
};

const PauseIntentHandler = {
  canHandle({ requestEnvelope: { request } }) {
    return (
      request.type === "IntentRequest" && request.intent.name === 'AMAZON.PauseIntent'
    )
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .addAudioPlayerStopDirective()
      .getResponse();
  }
}

const ResumeIntentHandler = {
  canHandle({ requestEnvelope: { request } }) {
    return (
      request.type === "IntentRequest" && request.intent.name === 'AMAZON.ResumeIntent'
    )
  },
  handle(handlerInput) {
    const offset = handlerInput.requestEnvelope.context.AudioPlayer.offsetInMilliseconds;
    return handlerInput.responseBuilder
      .addAudioPlayerPlayDirective('REPLACE_ALL', 'https://s3.eu-west-2.amazonaws.com/beat-files/110-4_4.mp3', 'abc', offset, undefined)
      .getResponse()
  }
}

module.exports = [
  audioEventHandler,
  PauseIntentHandler,
  ResumeIntentHandler
]
