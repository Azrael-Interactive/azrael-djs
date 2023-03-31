'use strict';

const BaseGuildTextChannel = require('./BaseGuildTextChannel');
const { Error } = require('../errors');

/**
 * Represents a guild news channel on Discord.
 * @extends {BaseGuildTextChannel}
 */
class NewsChannel extends BaseGuildTextChannel {
  /**
   * Adds the target to this channel's followers.
   * <info>If you need the created webhook id, use {@link GuildChannelManager#addFollower}.</info>
   * @param {TextChannelResolvable} channel The channel where the webhook should be created
   * @param {string} [reason] Reason for creating the webhook
   * @returns {Promise<NewsChannel>}
   * @example
   * if (channel.type === 'GUILD_NEWS') {
   *   channel.addFollower('222197033908436994', 'Important announcements')
   *     .then(() => console.log('Added follower'))
   *     .catch(console.error);
   * }
   */
  async addFollower(channel, reason) {
    const channelID = this.guild.channels.resolveID(channel);
    if (!channelID) throw new Error('GUILD_CHANNEL_RESOLVE');
    await this.client.api.channels(this.id).followers.post({ data: { webhook_channel_id: channelID }, reason });
    return this;
  }
}

module.exports = NewsChannel;
