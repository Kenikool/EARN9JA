import VirtualConcert from '../../models/virtualConcert/VirtualConcert.js';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

class VirtualConcertService {
  constructor() {
    this.outputDir = process.env.VIRTUAL_CONCERT_OUTPUT_DIR || './output/virtualConcert';
    this.streamingDir = process.env.VIRTUAL_CONCERT_STREAMING_DIR || './streaming/virtualConcert';
    this.recordingsDir = process.env.VIRTUAL_CONCERT_RECORDINGS_DIR || './recordings/virtualConcert';

    // Virtual concert configuration
    this.concertConfig = {
      // Streaming configuration
      streaming: {
        qualityLevels: {
          standard: {
            resolution: '720p',
            bitrate: 2500, // kbps
            fps: 30,
            bandwidth: 3 // Mbps
          },
          hd: {
            resolution: '1080p',
            bitrate: 5000,
            fps: 60,
            bandwidth: 6
          },
          '4k': {
            resolution: '2160p',
            bitrate: 15000,
            fps: 60,
            bandwidth: 20
          },
          '8k': {
            resolution: '4320p',
            bitrate: 50000,
            fps: 60,
            bandwidth: 60
          }
        },

        latencyTargets: {
          ultra_low: 200, // ms
          low: 500,
          standard: 2000,
          high: 5000
        },

        cdnProviders: [
          'AWS CloudFront',
          'Cloudflare',
          'Azure CDN',
          'Google Cloud CDN',
          'Fastly'
        ]
      },

      // Venue types and configurations
      venueTypes: {
        concert_hall: {
          name: 'Concert Hall',
          capacity: 2000,
          acoustics: 'classical',
          lighting: 'traditional',
          cameraPositions: ['front', 'left', 'right', 'overhead']
        },

        stadium: {
          name: 'Stadium',
          capacity: 50000,
          acoustics: 'arena',
          lighting: 'dynamic',
          cameraPositions: ['front', 'left', 'right', 'back', 'overhead', 'audience']
        },

        club: {
          name: 'Intimate Club',
          capacity: 500,
          acoustics: 'intimate',
          lighting: 'mood',
          cameraPositions: ['front', 'close_up', 'wide']
        },

        outdoor: {
          name: 'Outdoor Festival',
          capacity: 100000,
          acoustics: 'open_air',
          lighting: 'festival',
          cameraPositions: ['front', 'left', 'right', 'back', 'overhead', 'audience', 'aerial']
        },

        metaverse: {
          name: 'Metaverse Venue',
          capacity: 1000000,
          acoustics: 'spatial',
          lighting: 'interactive',
          cameraPositions: ['360_vr', 'first_person', 'third_person', 'cinematic']
        }
      },

      // Ticket tier templates
      ticketTiers: {
        basic: {
          name: 'Basic Access',
          benefits: ['hd_stream'],
          permissions: {
            streamQuality: 'hd',
            cameraAngles: 1,
            chatAccess: 'general'
          },
          priceMultiplier: 1.0
        },

        premium: {
          name: 'Premium Experience',
          benefits: ['4k_stream', 'multi_camera', 'exclusive_content'],
          permissions: {
            streamQuality: '4k',
            cameraAngles: 4,
            chatAccess: 'vip',
            interactiveFeatures: true
          },
          priceMultiplier: 2.5
        },

        vip: {
          name: 'VIP Experience',
          benefits: ['8k_stream', 'multi_camera', 'backstage_access', 'meet_greet', 'exclusive_content'],
          permissions: {
            streamQuality: '8k',
            cameraAngles: 8,
            chatAccess: 'vip',
            interactiveFeatures: true,
            backstageAccess: true
          },
          priceMultiplier: 5.0
        },

        ultimate: {
          name: 'Ultimate Experience',
          benefits: ['8k_stream', 'multi_camera', 'backstage_access', 'meet_greet', 'exclusive_content', 'recording_access', 'artist_interaction'],
          permissions: {
            streamQuality: '8k',
            cameraAngles: 12,
            chatAccess: 'artist',
            interactiveFeatures: true,
            backstageAccess: true,
            recordingAccess: true
          },
          priceMultiplier: 10.0
        }
      },

      // Interactive features
      interactiveFeatures: {
        chat: {
          maxMessageLength: 500,
          rateLimitPerMinute: 10,
          moderationEnabled: true,
          supportedFeatures: ['emojis', 'gifs', 'stickers', 'reactions']
        },

        virtualGifts: {
          types: [
            { name: 'Virtual Flower', price: 1, emoji: '🌹' },
            { name: 'Heart', price: 2, emoji: '❤️' },
            { name: 'Star', price: 5, emoji: '⭐' },
            { name: 'Crown', price: 10, emoji: '👑' },
            { name: 'Diamond', price: 25, emoji: '💎' },
            { name: 'Golden Mic', price: 50, emoji: '🎤' }
          ],
          maxPerUser: 100,
          revenueShare: 0.7 // 70% to artist, 30% to platform
        },

        audienceParticipation: {
          virtualApplause: {
            enabled: true,
            visualEffect: 'clapping_hands',
            audioEffect: 'applause_sound'
          },
          lightShow: {
            enabled: true,
            userControlled: true,
            syncWithMusic: true
          },
          polls: {
            maxOptions: 6,
            maxDuration: 300, // seconds
            realTimeResults: true
          }
        }
      },

      // Technical requirements
      technicalRequirements: {
        minimum: {
          bandwidth: 3, // Mbps
          cpu: 'Dual-core 2.5GHz',
          ram: '4GB',
          browser: ['Chrome 90+', 'Firefox 88+', 'Safari 14+', 'Edge 90+']
        },

        recommended: {
          bandwidth: 10,
          cpu: 'Quad-core 3.0GHz',
          ram: '8GB',
          gpu: 'Dedicated graphics card',
          browser: ['Chrome 100+', 'Firefox 95+', 'Safari 15+', 'Edge 100+']
        },

        optimal: {
          bandwidth: 25,
          cpu: 'Octa-core 3.5GHz',
          ram: '16GB',
          gpu: 'High-end graphics card',
          storage: '100GB available space'
        }
      }
    };

    this.ensureDirectories();
  }

  // Ensure required directories exist
  async ensureDirectories() {
    try {
      await fs.mkdir(this.outputDir, { recursive: true });
      await fs.mkdir(this.streamingDir, { recursive: true });
      await fs.mkdir(this.recordingsDir, { recursive: true });
      await fs.mkdir(path.join(this.streamingDir, 'live'), { recursive: true });
      await fs.mkdir(path.join(this.streamingDir, 'recordings'), { recursive: true });
      await fs.mkdir(path.join(this.recordingsDir, 'concerts'), { recursive: true });
    } catch (error) {
      console.error('Failed to create virtual concert directories:', error);
    }
  }

  // Create virtual concert
  async createVirtualConcert(organizerId, concertData) {
    try {
      console.log('Creating virtual concert:', concertData.title);

      const concertId = `concert_${Date.now()}_${uuidv4().substr(0, 8)}`;

      // Validate concert data
      await this.validateConcertData(concertData);

      // Generate default ticket tiers if not provided
      const ticketTiers = concertData.ticketTiers || this.generateDefaultTicketTiers(concertData.basePrice || 25);

      // Create default stage setup
      const defaultStage = this.createDefaultStage(concertData.venue?.environmentType || 'concert_hall');

      // Calculate concert duration
      const duration = concertData.duration || Math.floor((new Date(concertData.endTime) - new Date(concertData.startTime)) / (1000 * 60));

      const virtualConcert = new VirtualConcert({
        concertId,
        title: concertData.title,
        description: concertData.description || '',

        artists: concertData.artists.map((artist, index) => ({
          artistId: artist.artistId,
          role: artist.role || (index === 0 ? 'headliner' : 'opening_act'),
          performanceOrder: artist.performanceOrder || index + 1,
          setDuration: artist.setDuration || Math.floor(duration / concertData.artists.length),
          setlist: artist.setlist || []
        })),

        schedule: {
          startTime: new Date(concertData.startTime),
          endTime: new Date(concertData.endTime),
          timezone: concertData.timezone || 'UTC',
          duration,
          preShow: concertData.preShow || {
            startTime: new Date(new Date(concertData.startTime).getTime() - 30 * 60 * 1000), // 30 min before
            activities: [
              {
                type: 'soundcheck',
                startTime: new Date(new Date(concertData.startTime).getTime() - 30 * 60 * 1000),
                duration: 15,
                description: 'Technical soundcheck and preparation'
              }
            ]
          },
          postShow: concertData.postShow || {
            activities: [
              {
                type: 'meet_greet',
                startTime: new Date(new Date(concertData.endTime).getTime() + 15 * 60 * 1000),
                duration: 30,
                description: 'VIP meet and greet session'
              }
            ]
          }
        },

        format: {
          type: concertData.format?.type || 'live_performance',
          isInteractive: concertData.format?.isInteractive !== false,
          allowsAudienceParticipation: concertData.format?.allowsAudienceParticipation !== false,
          hasMultipleStages: concertData.format?.hasMultipleStages || false,
          supportedDevices: concertData.format?.supportedDevices || ['web', 'mobile', 'tablet', 'smart_tv']
        },

        venue: {
          name: concertData.venue?.name || 'Virtual Concert Hall',
          type: concertData.venue?.type || 'virtual_venue',
          capacity: concertData.venue?.capacity || 10000,
          virtualEnvironment: {
            theme: concertData.venue?.theme || 'modern',
            environmentType: concertData.venue?.environmentType || 'concert_hall',
            customization: {
              allowUserCustomization: concertData.venue?.allowUserCustomization || false,
              availableThemes: concertData.venue?.availableThemes || ['modern', 'classic', 'futuristic'],
              interactiveElements: concertData.venue?.interactiveElements || ['lighting', 'effects']
            }
          }
        },

        stages: [defaultStage],

        ticketing: {
          ticketTiers,
          totalCapacity: concertData.venue?.capacity || 10000,
          availableTickets: concertData.venue?.capacity || 10000,
          pricing: {
            currency: concertData.currency || 'USD',
            dynamicPricing: {
              enabled: concertData.dynamicPricing || false,
              basePrice: concertData.basePrice || 25,
              demandMultiplier: 1.5,
              timeMultiplier: 1.2
            }
          },
          saleSettings: {
            saleStartDate: concertData.saleStartDate ? new Date(concertData.saleStartDate) : new Date(),
            saleEndDate: concertData.saleEndDate ? new Date(concertData.saleEndDate) : new Date(concertData.startTime),
            presaleDate: concertData.presaleDate ? new Date(concertData.presaleDate) : null,
            waitlistEnabled: concertData.waitlistEnabled || false,
            transferPolicy: concertData.transferPolicy || 'allowed',
            refundPolicy: concertData.refundPolicy || 'partial_refund',
            refundDeadline: concertData.refundDeadline ? new Date(concertData.refundDeadline) : new Date(new Date(concertData.startTime).getTime() - 24 * 60 * 60 * 1000)
          }
        },

        streaming: {
          qualityOptions: this.generateQualityOptions(),
          delivery: {
            cdn: {
              provider: 'AWS CloudFront',
              regions: ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'],
              edgeLocations: ['global']
            },
            adaptiveBitrate: true,
            lowLatency: true,
            backup: {
              enabled: true,
              backupStreams: 2
            }
          },
          recording: {
            recordConcert: concertData.recordConcert !== false,
            recordingQuality: concertData.recordingQuality || '4k',
            multiTrackRecording: concertData.multiTrackRecording !== false,
            retentionPeriod: concertData.retentionPeriod || 365,
            downloadAccess: concertData.downloadAccess || 'ticket_holders'
          }
        },

        interactiveFeatures: {
          chat: {
            enabled: concertData.chatEnabled !== false,
            moderated: concertData.chatModerated !== false,
            moderators: [organizerId],
            chatRooms: [
              {
                roomId: 'general',
                name: 'General Chat',
                type: 'general',
                accessLevel: 'all'
              },
              {
                roomId: 'vip',
                name: 'VIP Chat',
                type: 'vip',
                accessLevel: 'vip'
              }
            ],
            features: {
              emojis: true,
              gifs: true,
              stickers: true,
              polls: true,
              reactions: true
            }
          },

          audienceParticipation: {
            virtualApplause: true,
            songRequests: concertData.allowSongRequests || false,
            qAndA: concertData.allowQAndA || false,
            polls: true,
            virtualGifts: true,
            lightShow: concertData.allowLightShow || false
          },

          social: {
            shareToSocial: true,
            inviteFriends: true,
            socialWall: concertData.socialWall || false,
            photoSharing: true
          }
        },

        attendees: [],

        analytics: {
          attendance: {
            totalAttendees: 0,
            peakConcurrentViewers: 0,
            averageWatchTime: 0,
            completionRate: 0,
            geographicDistribution: []
          },
          engagement: {
            totalInteractions: 0,
            chatMessages: 0,
            reactions: 0,
            virtualGifts: 0,
            socialShares: 0,
            engagementRate: 0
          },
          technical: {
            averageLatency: 0,
            bufferingEvents: 0,
            qualityIssues: 0,
            deviceBreakdown: [],
            bandwidthUsage: {
              total: 0,
              peak: 0,
              average: 0
            }
          },
          revenue: {
            totalRevenue: 0,
            ticketRevenue: 0,
            merchandiseRevenue: 0,
            virtualGiftRevenue: 0,
            tipRevenue: 0,
            revenueByTier: []
          }
        },

        status: 'planning',

        technicalRequirements: this.concertConfig.technicalRequirements.minimum,

        monetization: {
          revenueSharing: [
            { party: 'artist', percentage: 70 },
            { party: 'platform', percentage: 30 }
          ],
          merchandising: {
            enabled: concertData.merchandisingEnabled || false,
            items: concertData.merchandiseItems || []
          },
          sponsorship: {
            sponsors: concertData.sponsors || [],
            sponsorshipRevenue: 0
          }
        },

        legal: {
          ageRestriction: concertData.ageRestriction || 0,
          contentRating: concertData.contentRating || 'PG',
          geographicRestrictions: concertData.geographicRestrictions || [],
          copyrightClearance: {
            musicLicensing: true,
            performanceRights: true,
            broadcastRights: true,
            recordingRights: true
          },
          privacyCompliance: {
            gdprCompliant: true,
            ccpaCompliant: true,
            dataRetentionPeriod: 365
          }
        },

        organizer: organizerId,
        team: [
          {
            userId: organizerId,
            role: 'producer',
            permissions: ['all']
          }
        ],

        integrations: {
          socialPlatforms: [
            { platform: 'twitter', enabled: true },
            { platform: 'facebook', enabled: true },
            { platform: 'instagram', enabled: true }
          ],
          streamingPlatforms: [],
          paymentProviders: [
            { provider: 'stripe', enabled: true }
          ]
        }
      });

      await virtualConcert.save();

      console.log('Virtual concert created successfully');
      return virtualConcert;
    } catch (error) {
      console.error('Virtual concert creation error:', error);
      throw new Error(`Virtual concert creation failed: ${error.message}`);
    }
  }

  // Validate concert data
  async validateConcertData(concertData) {
    if (!concertData.title || concertData.title.trim().length === 0) {
      throw new Error('Concert title is required');
    }

    if (!concertData.artists || concertData.artists.length === 0) {
      throw new Error('At least one artist is required');
    }

    if (!concertData.startTime) {
      throw new Error('Start time is required');
    }

    if (!concertData.endTime) {
      throw new Error('End time is required');
    }

    const startTime = new Date(concertData.startTime);
    const endTime = new Date(concertData.endTime);

    if (startTime >= endTime) {
      throw new Error('End time must be after start time');
    }

    if (startTime <= new Date()) {
      throw new Error('Start time must be in the future');
    }

    const duration = (endTime - startTime) / (1000 * 60); // in minutes
    if (duration < 15) {
      throw new Error('Concert must be at least 15 minutes long');
    }

    if (duration > 480) { // 8 hours
      throw new Error('Concert cannot be longer than 8 hours');
    }

    return true;
  }

  // Generate default ticket tiers
  generateDefaultTicketTiers(basePrice) {
    const tiers = [];

    Object.entries(this.concertConfig.ticketTiers).forEach(([tierKey, tierConfig], index) => {
      const price = Math.round(basePrice * tierConfig.priceMultiplier);

      tiers.push({
        tierId: `tier_${index + 1}`,
        name: tierConfig.name,
        description: `${tierConfig.name} with ${tierConfig.benefits.join(', ')}`,
        price,
        currency: 'USD',
        totalTickets: Math.floor(1000 / (index + 1)), // Decreasing availability for higher tiers
        availableTickets: Math.floor(1000 / (index + 1)),
        benefits: tierConfig.benefits,
        permissions: tierConfig.permissions,
        saleSettings: {
          saleStartDate: new Date(),
          isTransferable: true,
          isRefundable: index > 0 // Only premium tiers are refundable
        },
        isActive: true
      });
    });

    return tiers;
  }

  // Create default stage setup
  createDefaultStage(environmentType) {
    const venueConfig = this.concertConfig.venueTypes[environmentType] || this.concertConfig.venueTypes.concert_hall;

    return {
      stageId: 'main_stage',
      name: 'Main Stage',
      type: 'main_stage',
      configuration: {
        cameras: venueConfig.cameraPositions.map((position, index) => ({
          cameraId: `cam_${index + 1}`,
          name: `${position.charAt(0).toUpperCase() + position.slice(1)} Camera`,
          position,
          quality: '4k',
          isActive: true,
          isPrimary: index === 0
        })),
        audio: {
          channels: [
            { channelId: 'master', name: 'Master Mix', type: 'master', isActive: true },
            { channelId: 'vocals', name: 'Vocals', type: 'vocals', isActive: true },
            { channelId: 'instruments', name: 'Instruments', type: 'instruments', isActive: true }
          ],
          quality: 'lossless',
          spatialAudio: environmentType === 'metaverse'
        },
        lighting: {
          scenes: [
            {
              sceneId: 'scene_1',
              name: 'Opening',
              description: 'Concert opening lighting',
              colors: ['#FF6B6B', '#4ECDC4', '#45B7D1'],
              intensity: 80,
              effects: ['fade_in', 'color_cycle']
            },
            {
              sceneId: 'scene_2',
              name: 'Performance',
              description: 'Main performance lighting',
              colors: ['#96CEB4', '#FFEAA7', '#DDA0DD'],
              intensity: 100,
              effects: ['strobe', 'spotlight']
            }
          ],
          isInteractive: environmentType === 'metaverse'
        },
        virtualElements: {
          background: {
            type: environmentType === 'metaverse' ? '3d_environment' : 'image',
            url: `/backgrounds/${environmentType}_default.jpg`,
            settings: {}
          },
          effects: [
            {
              effectId: 'effect_1',
              name: 'Confetti',
              type: 'confetti',
              settings: { colors: ['#FF6B6B', '#4ECDC4', '#45B7D1'] },
              triggers: ['song_end', 'applause_peak']
            }
          ],
          overlays: [
            {
              overlayId: 'overlay_1',
              name: 'Chat Overlay',
              type: 'chat',
              position: { x: 10, y: 10, width: 300, height: 400 },
              isVisible: true
            }
          ]
        }
      },
      schedule: [],
      isActive: true
    };
  }

  // Generate quality options
  generateQualityOptions() {
    return Object.entries(this.concertConfig.streaming.qualityLevels).map(([quality, config]) => ({
      quality,
      bitrate: config.bitrate,
      resolution: config.resolution,
      fps: config.fps,
      requiredBandwidth: config.bandwidth
    }));
  }

  // Purchase ticket
  async purchaseTicket(concertId, userId, ticketData) {
    try {
      console.log('Processing ticket purchase for concert:', concertId, 'user:', userId);

      const concert = await VirtualConcert.findOne({ concertId });
      if (!concert) {
        throw new Error('Concert not found');
      }

      // Check if concert is available for ticket sales
      if (!['announced', 'tickets_on_sale'].includes(concert.status)) {
        throw new Error('Tickets are not currently available for this concert');
      }

      // Check if user already has a ticket
      const existingAttendee = concert.attendees.find(a => a.userId.equals(userId));
      if (existingAttendee) {
        throw new Error('User already has a ticket for this concert');
      }

      // Find the ticket tier
      const tier = concert.ticketing.ticketTiers.find(t => t.tierId === ticketData.tierId);
      if (!tier) {
        throw new Error('Invalid ticket tier');
      }

      // Check availability
      if (tier.availableTickets <= 0) {
        throw new Error('This ticket tier is sold out');
      }

      // Generate ticket ID
      const ticketId = `ticket_${Date.now()}_${uuidv4().substr(0, 8)}`;

      // Process payment (simulated)
      const paymentResult = await this.processPayment(userId, tier.price, tier.currency, ticketId);

      if (!paymentResult.success) {
        throw new Error('Payment processing failed');
      }

      // Add attendee to concert
      await concert.addAttendee(userId, {
        ticketId,
        ticketTier: ticketData.tierId
      });

      // Update revenue analytics
      concert.analytics.revenue.ticketRevenue += tier.price;
      concert.analytics.revenue.totalRevenue += tier.price;

      // Add to tier revenue tracking
      let tierRevenue = concert.analytics.revenue.revenueByTier.find(r => r.tier === ticketData.tierId);
      if (!tierRevenue) {
        tierRevenue = { tier: ticketData.tierId, revenue: 0, ticketsSold: 0 };
        concert.analytics.revenue.revenueByTier.push(tierRevenue);
      }
      tierRevenue.revenue += tier.price;
      tierRevenue.ticketsSold += 1;

      await concert.save();

      console.log('Ticket purchased successfully');
      return {
        ticketId,
        concertId: concert.concertId,
        concertTitle: concert.title,
        tierName: tier.name,
        price: tier.price,
        currency: tier.currency,
        purchaseDate: new Date(),
        benefits: tier.benefits,
        permissions: tier.permissions
      };
    } catch (error) {
      console.error('Ticket purchase error:', error);
      throw error;
    }
  }

  // Process payment (simulated)
  async processPayment(userId, amount, currency, ticketId) {
    // Simulate payment processing
    console.log(`Processing payment: User ${userId}, Amount ${amount} ${currency}, Ticket ${ticketId}`);

    // In production, integrate with actual payment providers
    return {
      success: true,
      transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      amount,
      currency,
      processedAt: new Date()
    };
  }

  // Join concert (check-in)
  async joinConcert(concertId, userId) {
    try {
      console.log('User joining concert:', concertId, userId);

      const concert = await VirtualConcert.findOne({ concertId });
      if (!concert) {
        throw new Error('Concert not found');
      }

      // Check if concert is live or about to start
      const now = new Date();
      const concertStart = new Date(concert.schedule.startTime);
      const preShowStart = new Date(concertStart.getTime() - 30 * 60 * 1000); // 30 minutes before

      if (now < preShowStart) {
        throw new Error('Concert has not started yet');
      }

      if (concert.status === 'completed') {
        throw new Error('Concert has already ended');
      }

      // Check in attendee
      await concert.checkInAttendee(userId);

      // Update peak concurrent viewers if needed
      const currentViewers = concert.attendees.filter(a =>
        a.attendance.joinedAt && !a.attendance.leftAt
      ).length;

      if (currentViewers > concert.analytics.attendance.peakConcurrentViewers) {
        concert.analytics.attendance.peakConcurrentViewers = currentViewers;
      }

      await concert.save();

      console.log('User joined concert successfully');
      return {
        concertId: concert.concertId,
        joinedAt: new Date(),
        streamingInfo: this.getStreamingInfo(concert, userId),
        interactiveFeatures: this.getInteractiveFeatures(concert, userId)
      };
    } catch (error) {
      console.error('Concert join error:', error);
      throw error;
    }
  }

  // Get streaming information for user
  getStreamingInfo(concert, userId) {
    const attendee = concert.attendees.find(a => a.userId.equals(userId));
    if (!attendee) {
      throw new Error('User is not an attendee of this concert');
    }

    const tier = concert.ticketing.ticketTiers.find(t => t.tierId === attendee.ticketTier);
    const permissions = tier ? tier.permissions : { streamQuality: 'standard', cameraAngles: 1 };

    return {
      streamUrls: this.generateStreamUrls(concert, permissions.streamQuality),
      cameraAngles: this.getAvailableCameraAngles(concert, permissions.cameraAngles),
      audioChannels: this.getAvailableAudioChannels(concert, permissions),
      qualityOptions: concert.streaming.qualityOptions.filter(q =>
        this.isQualityAllowed(q.quality, permissions.streamQuality)
      )
    };
  }

  // Generate stream URLs
  generateStreamUrls(concert, maxQuality) {
    const baseUrl = `https://stream.musicplatform.com/live/${concert.concertId}`;
    const urls = {};

    concert.streaming.qualityOptions.forEach(option => {
      if (this.isQualityAllowed(option.quality, maxQuality)) {
        urls[option.quality] = `${baseUrl}/${option.quality}/playlist.m3u8`;
      }
    });

    return urls;
  }

  // Check if quality is allowed
  isQualityAllowed(quality, maxQuality) {
    const qualityLevels = ['standard', 'hd', '4k', '8k'];
    const maxIndex = qualityLevels.indexOf(maxQuality);
    const currentIndex = qualityLevels.indexOf(quality);

    return currentIndex <= maxIndex;
  }

  // Get available camera angles
  getAvailableCameraAngles(concert, maxAngles) {
    const mainStage = concert.stages.find(s => s.type === 'main_stage');
    if (!mainStage) return [];

    return mainStage.configuration.cameras
      .filter(cam => cam.isActive)
      .slice(0, maxAngles)
      .map(cam => ({
        cameraId: cam.cameraId,
        name: cam.name,
        position: cam.position,
        quality: cam.quality,
        isPrimary: cam.isPrimary
      }));
  }

  // Get available audio channels
  getAvailableAudioChannels(concert, permissions) {
    const mainStage = concert.stages.find(s => s.type === 'main_stage');
    if (!mainStage) return [];

    let channels = mainStage.configuration.audio.channels.filter(ch => ch.isActive);

    // Filter based on permissions
    if (!permissions.interactiveFeatures) {
      channels = channels.filter(ch => ch.type === 'master');
    }

    return channels.map(ch => ({
      channelId: ch.channelId,
      name: ch.name,
      type: ch.type
    }));
  }

  // Get interactive features for user
  getInteractiveFeatures(concert, userId) {
    const attendee = concert.attendees.find(a => a.userId.equals(userId));
    if (!attendee) return {};

    const tier = concert.ticketing.ticketTiers.find(t => t.tierId === attendee.ticketTier);
    const permissions = tier ? tier.permissions : {};

    return {
      chat: {
        enabled: concert.interactiveFeatures.chat.enabled,
        accessLevel: permissions.chatAccess || 'general',
        availableRooms: concert.interactiveFeatures.chat.chatRooms.filter(room =>
          this.canAccessChatRoom(room, permissions.chatAccess)
        )
      },

      audienceParticipation: {
        virtualApplause: concert.interactiveFeatures.audienceParticipation.virtualApplause,
        virtualGifts: concert.interactiveFeatures.audienceParticipation.virtualGifts,
        polls: concert.interactiveFeatures.audienceParticipation.polls,
        songRequests: concert.interactiveFeatures.audienceParticipation.songRequests && permissions.interactiveFeatures,
        qAndA: concert.interactiveFeatures.audienceParticipation.qAndA && permissions.interactiveFeatures
      },

      backstageAccess: permissions.backstageAccess || false,
      recordingAccess: permissions.recordingAccess || false
    };
  }

  // Check if user can access chat room
  canAccessChatRoom(room, userAccessLevel) {
    const accessHierarchy = ['general', 'vip', 'artist'];
    const roomIndex = accessHierarchy.indexOf(room.accessLevel);
    const userIndex = accessHierarchy.indexOf(userAccessLevel);

    return userIndex >= roomIndex;
  }

  // Send interaction
  async sendInteraction(concertId, userId, interactionData) {
    try {
      console.log('Processing interaction for concert:', concertId, 'type:', interactionData.type);

      const concert = await VirtualConcert.findOne({ concertId });
      if (!concert) {
        throw new Error('Concert not found');
      }

      // Validate interaction data
      await this.validateInteraction(interactionData);

      // Check if user is an attendee
      const attendee = concert.attendees.find(a => a.userId.equals(userId));
      if (!attendee) {
        throw new Error('User is not an attendee of this concert');
      }

      // Check permissions for interaction type
      const tier = concert.ticketing.ticketTiers.find(t => t.tierId === attendee.ticketTier);
      if (!this.canSendInteraction(interactionData.type, tier?.permissions)) {
        throw new Error('User does not have permission for this interaction type');
      }

      // Add interaction to concert
      await concert.addInteraction(userId, interactionData);

      console.log('Interaction sent successfully');
      return {
        interactionId: concert.attendees.find(a => a.userId.equals(userId)).interactions.slice(-1)[0].interactionId,
        timestamp: new Date(),
        type: interactionData.type
      };
    } catch (error) {
      console.error('Interaction error:', error);
      throw error;
    }
  }

  // Validate interaction
  async validateInteraction(interactionData) {
    if (!interactionData.type) {
      throw new Error('Interaction type is required');
    }

    const validTypes = [
      'chat_message', 'emoji_reaction', 'virtual_applause', 'song_request', 'question',
      'tip_donation', 'virtual_gift', 'poll_vote', 'cheer', 'wave', 'heart'
    ];

    if (!validTypes.includes(interactionData.type)) {
      throw new Error('Invalid interaction type');
    }

    if (interactionData.type === 'chat_message' && !interactionData.content?.message) {
      throw new Error('Chat message content is required');
    }

    if (interactionData.type === 'virtual_gift' && !interactionData.content?.giftType) {
      throw new Error('Gift type is required for virtual gifts');
    }

    return true;
  }

  // Check if user can send interaction
  canSendInteraction(interactionType, permissions) {
    const restrictedInteractions = ['song_request', 'question'];

    if (restrictedInteractions.includes(interactionType)) {
      return permissions?.interactiveFeatures || false;
    }

    return true;
  }

  // Start concert
  async startConcert(concertId, organizerId) {
    try {
      console.log('Starting concert:', concertId);

      const concert = await VirtualConcert.findOne({ concertId });
      if (!concert) {
        throw new Error('Concert not found');
      }

      // Check if user is the organizer or has permission
      if (!concert.organizer.equals(organizerId)) {
        const teamMember = concert.team.find(t => t.userId.equals(organizerId));
        if (!teamMember || !['producer', 'director'].includes(teamMember.role)) {
          throw new Error('User does not have permission to start this concert');
        }
      }

      // Update concert status
      await concert.updateStatus('live');

      // Initialize streaming
      await this.initializeStreaming(concert);

      console.log('Concert started successfully');
      return {
        concertId: concert.concertId,
        status: concert.status,
        startedAt: new Date(),
        streamingInfo: {
          isLive: true,
          streamUrls: this.generateStreamUrls(concert, '8k'),
          backupStreams: concert.streaming.delivery.backup.backupStreams
        }
      };
    } catch (error) {
      console.error('Concert start error:', error);
      throw error;
    }
  }

  // Initialize streaming
  async initializeStreaming(concert) {
    // Simulate streaming initialization
    console.log('Initializing streaming for concert:', concert.concertId);

    // In production, this would:
    // 1. Set up CDN endpoints
    // 2. Initialize encoding servers
    // 3. Configure backup streams
    // 4. Start recording if enabled

    return true;
  }

  // End concert
  async endConcert(concertId, organizerId) {
    try {
      console.log('Ending concert:', concertId);

      const concert = await VirtualConcert.findOne({ concertId });
      if (!concert) {
        throw new Error('Concert not found');
      }

      // Check permissions
      if (!concert.organizer.equals(organizerId)) {
        const teamMember = concert.team.find(t => t.userId.equals(organizerId));
        if (!teamMember || !['producer', 'director'].includes(teamMember.role)) {
          throw new Error('User does not have permission to end this concert');
        }
      }

      // Update concert status
      await concert.updateStatus('completed');

      // Calculate final analytics
      await this.calculateFinalAnalytics(concert);

      // Stop streaming
      await this.stopStreaming(concert);

      await concert.save();

      console.log('Concert ended successfully');
      return {
        concertId: concert.concertId,
        status: concert.status,
        endedAt: new Date(),
        finalAnalytics: concert.analytics
      };
    } catch (error) {
      console.error('Concert end error:', error);
      throw error;
    }
  }

  // Calculate final analytics
  async calculateFinalAnalytics(concert) {
    // Calculate completion rate
    const totalAttendees = concert.analytics.attendance.totalAttendees;
    const attendeesWhoStayed = concert.attendees.filter(a =>
      a.attendance.totalWatchTime >= concert.concertDuration * 0.8 // Stayed for 80% of concert
    ).length;

    concert.analytics.attendance.completionRate = totalAttendees > 0 ?
      Math.round((attendeesWhoStayed / totalAttendees) * 100) : 0;

    // Calculate average watch time
    const totalWatchTime = concert.attendees.reduce((sum, a) => sum + (a.attendance.totalWatchTime || 0), 0);
    concert.analytics.attendance.averageWatchTime = totalAttendees > 0 ?
      Math.round(totalWatchTime / totalAttendees) : 0;

    // Calculate engagement rate
    concert.calculateEngagementRate();

    // Geographic distribution (simulated)
    concert.analytics.attendance.geographicDistribution = [
      { country: 'United States', region: 'North America', attendeeCount: Math.floor(totalAttendees * 0.4), percentage: 40 },
      { country: 'United Kingdom', region: 'Europe', attendeeCount: Math.floor(totalAttendees * 0.2), percentage: 20 },
      { country: 'Canada', region: 'North America', attendeeCount: Math.floor(totalAttendees * 0.15), percentage: 15 },
      { country: 'Australia', region: 'Oceania', attendeeCount: Math.floor(totalAttendees * 0.1), percentage: 10 },
      { country: 'Germany', region: 'Europe', attendeeCount: Math.floor(totalAttendees * 0.15), percentage: 15 }
    ];
  }

  // Stop streaming
  async stopStreaming(concert) {
    // Simulate streaming cleanup
    console.log('Stopping streaming for concert:', concert.concertId);

    // In production, this would:
    // 1. Stop encoding servers
    // 2. Finalize recordings
    // 3. Clean up CDN resources
    // 4. Archive stream data

    return true;
  }

  // Get concert analytics
  async getConcertAnalytics(concertId, userId) {
    try {
      const concert = await VirtualConcert.findOne({ concertId })
        .populate('organizer', 'username displayName')
        .populate('artists.artistId', 'username displayName');

      if (!concert) {
        throw new Error('Concert not found');
      }

      // Check if user has access to analytics
      const isOrganizer = concert.organizer._id.equals(userId);
      const isTeamMember = concert.team.some(t => t.userId.equals(userId));
      const isArtist = concert.artists.some(a => a.artistId._id.equals(userId));

      if (!isOrganizer && !isTeamMember && !isArtist) {
        throw new Error('Access denied');
      }

      return {
        concertId: concert.concertId,
        title: concert.title,
        status: concert.status,

        attendance: concert.analytics.attendance,
        engagement: concert.analytics.engagement,
        technical: concert.analytics.technical,
        revenue: concert.analytics.revenue,

        ticketSales: {
          totalSold: concert.ticketing.soldTickets,
          totalCapacity: concert.ticketing.totalCapacity,
          salesByTier: concert.analytics.revenue.revenueByTier,
          soldOutPercentage: concert.ticketAvailability.soldOutPercentage
        },

        performance: {
          duration: concert.concertDuration,
          completionRate: concert.analytics.attendance.completionRate,
          averageWatchTime: concert.analytics.attendance.averageWatchTime,
          peakViewers: concert.analytics.attendance.peakConcurrentViewers,
          engagementRate: concert.analytics.engagement.engagementRate
        }
      };
    } catch (error) {
      console.error('Analytics retrieval error:', error);
      throw error;
    }
  }

  // Get virtual concert statistics
  async getVirtualConcertStatistics(timeframe = 30) {
    try {
      const stats = await VirtualConcert.getConcertStatistics(timeframe);

      return stats[0] || {
        totalConcerts: 0,
        totalAttendees: 0,
        totalRevenue: 0,
        averageAttendance: 0,
        averageEngagement: 0,
        completedConcerts: 0
      };
    } catch (error) {
      console.error('Statistics calculation error:', error);
      throw error;
    }
  }

  // Clean up old concert data
  async cleanup(olderThanDays = 365) {
    try {
      const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);

      // Archive old completed concerts
      const oldConcerts = await VirtualConcert.find({
        status: 'completed',
        'schedule.endTime': { $lt: cutoffDate }
      });

      let archivedConcerts = 0;
      let cleanedRecordings = 0;

      for (const concert of oldConcerts) {
        // Clean up recordings if retention period expired
        if (concert.streaming.recording.retentionPeriod) {
          const recordingExpiry = new Date(concert.schedule.endTime.getTime() +
            concert.streaming.recording.retentionPeriod * 24 * 60 * 60 * 1000);

          if (new Date() > recordingExpiry) {
            // Delete recording files (simulated)
            console.log(`Cleaning up recordings for concert: ${concert.concertId}`);
            cleanedRecordings++;
          }
        }

        // Archive concert data
        await VirtualConcert.deleteOne({ _id: concert._id });
        archivedConcerts++;
      }

      console.log(`Archived ${archivedConcerts} concerts and cleaned ${cleanedRecordings} recordings`);

      return { archivedConcerts, cleanedRecordings };
    } catch (error) {
      console.error('Virtual concert cleanup error:', error);
      throw error;
    }
  }
}

export default new VirtualConcertService();