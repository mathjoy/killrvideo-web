import { COMMENTS_SERVICE } from '../services/comments';
import { uuidToString, stringToUuid, timestampToDateString } from '../utils/protobuf-conversions';
import { toRef } from './common/sentinels';
import { createPropPicker } from './common/props';
import { pipe, prop, of as toArray, prepend } from 'ramda';
import * as Common from './common';
import { logger } from '../utils/logging';
import uuid from 'uuid';

const commentsMap = {
  'commentId': pipe(prop('commentId'), uuidToString),
  'addedDate': pipe(prop('commentTimestamp'), timestampToDateString),
  'author': pipe(prop('userId'), uuidToString, toArray, prepend('usersById'), toRef),
  'video': pipe(prop('videoId'), uuidToString, toArray, prepend('videosById'), toRef)
};

const pickCommentProps = createPropPicker(commentsMap);

const routes = [
  {
    // Reference point for comments on a video
    route: 'videosById[{keys:videoIds}].comments',
    get: Common.listReference(
      path => ({ pageSize: 1, videoId: stringToUuid(path[1]) }),
      COMMENTS_SERVICE,
      (req, client) => { return client.getVideoCommentsAsync(req); },
      [ 'commentId' ], 
      pickCommentProps
    )
  },
  {
    // The comments for a video list
    route: 'videosById[{keys:videoIds}].commentsList[{keys:startingTokens}][{ranges:indexRanges}]["commentId", "comment", "addedDate", "author"]',
    get: Common.pagedServiceRequest(
      path => {
        return {
          videoId: stringToUuid(path[1]),
          startingCommentId: stringToUuid(path[3])
        };
      },
      COMMENTS_SERVICE,
      (req, client) => { return client.getVideoCommentsAsync(req); },
      pickCommentProps
    )
  },
  {
    // Reference point for comments made by a user
    route: 'usersById[{keys:userIds}].comments',
    get: Common.listReference(
      path => ({ pageSize: 1, userId: stringToUuid(path[1]) }),
      COMMENTS_SERVICE,
      (req, client) => { return client.getUserCommentsAsync(req); },
      [ 'commentId' ],
      pickCommentProps
    )
  },
  {
    route: 'usersById[{keys:userIds}].commentsList[{keys:startingTokens}][{ranges:indexRanges}]["commentId", "comment", "addedDate", "video"]',
    get: Common.pagedServiceRequest(
      path => {
        return {
          userId: stringToUuid(path[1]),
          startingCommentId: stringToUuid(path[3])
        };
      },
      COMMENTS_SERVICE,
      (req, client) => { return client.getUserCommentsAsync(req); },
      pickCommentProps
    )
  },
  {
    // Leave a comment on a video
    route: 'videosById[{keys:videoIds}].comments.add',
    call(callPath, args) {
      const [ comment ] = args;
      let pathValues = [];
      
      if (callPath.videoIds.length !== 1) {
        callPath.videoIds.forEach(videoId => {
          pathValues.push({
            path: [ 'videosById', videoId, 'comments', 'addErrors' ],
            value: $error('Cannot add a comment to multiple videos.')
          });
        });
        return pathValues;
      }
      
      const videoId = callPath.videoIds[0];
      
      // Get current user
      const userId = this.getCurrentUserId();
      if (userId === null) {
        pathValues.push({
          path: [ 'videosById', videoId, 'comments', 'addErrors' ],
          value: $error('Not currently logged in')
        });
        return pathValues;
      }
      
      // Create the request for the service
      let commentId = uuid.v1();
      let request = {
        videoId: stringToUuid(videoId), 
        userId: stringToUuid(userId), 
        commentId: stringToUuid(commentId), 
        comment
      };
      
      // Make the request
      let client = this.getServiceClient(COMMENTS_SERVICE);
      return client.commentOnVideoAsync(request)
        .then(response => {
          return [
            { path: [ 'videosById', videoId, 'comments' ], invalidated: true },
            { path: [ 'usersById', userId, 'comments' ], invalidated: true }
          ];
        })
        .catch(err => {
          logger.log('error', 'Error while commenting on video', err);
          return [
            { path: [ 'videosById', videoId, 'comments', 'addErrors' ], value: $error(err.message) }
          ];
        });
    }
  }
];

export default routes;