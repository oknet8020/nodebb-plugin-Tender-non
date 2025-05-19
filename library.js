'use strict';

const Topics = require.main.require('./src/topics');
const Privileges = require.main.require('./src/privileges');

const Plugin = {};

// מזהי הקטגוריות שבהן תופעל ההסתרה
const TARGET_CATEGORY_IDS = [69, 70, 71];

Plugin.filterPostGet = async function (hookData) {
  try {
    const post = hookData.post;
    const userId = hookData.uid;

    if (!post || !post.tid || post.isMain) {
      return hookData;
    }

    const topicData = await Topics.getTopicFields(post.tid, ['uid', 'cid']);
    const isTopicOwner = userId === topicData.uid;
    const isAdmin = await Privileges.global.can('admin:manage:users', userId);

    const logPrefix = `[Tender-non] פוסט ${post.pid} / נושא ${post.tid}`;
    console.log(`${logPrefix} → נצפה ע״י UID ${userId}`);
    console.log(`${logPrefix} → UID של פותח הנושא: ${topicData.uid}`);
    console.log(`${logPrefix} → CID של הקטגוריה: ${topicData.cid}`);
    console.log(`${logPrefix} → בודק אם category ${topicData.cid} ב-[${TARGET_CATEGORY_IDS.join(', ')}]`);

    if (!TARGET_CATEGORY_IDS.includes(topicData.cid)) {
      console.log(`${logPrefix} → לא בקטגוריה שמוסתרת`);
      return hookData;
    }

    if (!isTopicOwner && !isAdmin) {
      console.log(`${logPrefix} → לא הבעלים ולא מנהל – הסתרה`);
      post.content = '[תגובה מוסתרת]';
    } else {
      console.log(`${logPrefix} → צפייה מותרת`);
    }

    return hookData;
  } catch (err) {
    console.error('[Tender-non] שגיאה בסינון:', err);
    return hookData;
  }
};

module.exports = Plugin;
