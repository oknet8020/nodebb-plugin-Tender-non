'use strict';

const Topics = require.main.require('./src/topics');
const Privileges = require.main.require('./src/privileges');

const Plugin = {};

// מזהי הקטגוריות שבהן יוחלו ההגבלות
const TARGET_CATEGORY_IDS = [69, 70, 71];

Plugin.filterPostGet = async function (hookData) {
  try {
    const post = hookData.post;
    const userId = hookData.uid;

    // אם זה הפוסט הראשי של השרשור – תמיד להציג
    if (!post || !post.tid || post.isMain) {
      return hookData;
    }

    // נשלוף את בעל השרשור והקטגוריה
    const topicData = await Topics.getTopicFields(post.tid, ['uid', 'cid']);

    // האם המשתמש הנוכחי הוא בעל השרשור?
    const isTopicOwner = userId === topicData.uid;

    // האם המשתמש הוא מנהל (הרשאה גלובלית לניהול משתמשים)?
    const isAdmin = await Privileges.global.can('admin:manage:users', userId);

    // אם הפוסט לא שייך לקטגוריות המוגדרות – לא נעשה כלום
    if (!TARGET_CATEGORY_IDS.includes(topicData.cid)) {
      return hookData;
    }

    // הסתרת התגובה אם המשתמש אינו בעל השרשור ואינו מנהל
    if (!isTopicOwner && !isAdmin) {
      post.content = '[תגובה מוסתרת]';
    }

    return hookData;
  } catch (err) {
    console.error('[Tender-non] שגיאה בסינון תגובות:', err);
    return hookData;
  }
};

module.exports = Plugin;
