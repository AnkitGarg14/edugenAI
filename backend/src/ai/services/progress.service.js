const TopicProgress = require('../../models/TopicProgress');

const getUserLearningProfile = async (userId) => {
  try {
    const progressDocs = await TopicProgress.find({ user: userId });
    
    if (!progressDocs || progressDocs.length === 0) {
      return '';
    }

    const weakTopics = progressDocs.filter(doc => doc.status === 'weak').map(d => d.topic);
    const strongTopics = progressDocs.filter(doc => doc.status === 'strong').map(d => d.topic);
    const averageTopics = progressDocs.filter(doc => doc.status === 'average').map(d => d.topic);

    let profileStr = '<learning_profile>\n';
    if (weakTopics.length > 0) profileStr += `Weak Topics (needs simpler explanations and practice): ${weakTopics.join(', ')}\n`;
    if (averageTopics.length > 0) profileStr += `Average Topics: ${averageTopics.join(', ')}\n`;
    if (strongTopics.length > 0) profileStr += `Strong Topics (can be challenged): ${strongTopics.join(', ')}\n`;
    profileStr += '</learning_profile>\n';

    return profileStr;
  } catch (err) {
    console.error('Error fetching learning profile:', err);
    return '';
  }
};

module.exports = { getUserLearningProfile };
