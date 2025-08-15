const nodemailer = require('nodemailer');
const Alert = require('../models/Alert');

class AlertService {
  constructor() {
    this.emailTransporter = null;
    this.initializeEmailTransporter();
  }

  initializeEmailTransporter() {
    if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      this.emailTransporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
      console.log('📧 Email transporter initialized');
    } else {
      console.log('⚠️  Email configuration not found, email alerts disabled');
    }
  }

  async sendEmailAlert(alert, recipients = ['admin@environmental-monitoring.com']) {
    if (!this.emailTransporter) {
      console.log('Email transporter not available');
      return false;
    }

    try {
      const severityEmoji = {
        warning: '⚠️',
        danger: '🚨',
        critical: '🔴'
      };

      const subject = `${severityEmoji[alert.severity]} Environmental Alert - ${alert.parameter.toUpperCase()} ${alert.severity.toUpperCase()}`;
      
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: ${alert.severity === 'danger' ? '#dc3545' : '#ffc107'}; color: white; padding: 20px; text-align: center;">
            <h1>${severityEmoji[alert.severity]} Environmental Alert</h1>
          </div>
          
          <div style="padding: 20px; background: #f8f9fa;">
            <h2>Alert Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Sensor ID:</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${alert.sensorId}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Parameter:</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${alert.parameter.toUpperCase()}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Current Value:</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${alert.currentValue.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Threshold:</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${alert.thresholdValue.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Location:</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${alert.location.address}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Time:</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${new Date(alert.createdAt).toLocaleString()}</td>
              </tr>
            </table>
            
            <div style="margin: 20px 0; padding: 15px; background: ${alert.severity === 'danger' ? '#f8d7da' : '#fff3cd'}; border-left: 4px solid ${alert.severity === 'danger' ? '#dc3545' : '#ffc107'};">
              <strong>Message:</strong> ${alert.message}
            </div>
            
            <div style="margin-top: 20px; text-align: center;">
              <p style="color: #666;">This is an automated alert from the Environmental Monitoring System.</p>
              <p style="color: #666;">Please take appropriate action based on the severity level.</p>
            </div>
          </div>
        </div>
      `;

      for (const recipient of recipients) {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: recipient,
          subject: subject,
          html: htmlContent
        };

        await this.emailTransporter.sendMail(mailOptions);
        
        // Update alert with notification status
        await Alert.findByIdAndUpdate(alert._id, {
          $push: {
            notificationsSent: {
              type: 'email',
              recipient: recipient,
              sentAt: new Date(),
              status: 'sent'
            }
          }
        });
      }

      console.log(`📧 Email alert sent for ${alert.sensorId} - ${alert.parameter}`);
      return true;
    } catch (error) {
      console.error('Error sending email alert:', error);
      
      // Update alert with failed notification status
      await Alert.findByIdAndUpdate(alert._id, {
        $push: {
          notificationsSent: {
            type: 'email',
            recipient: recipients.join(','),
            sentAt: new Date(),
            status: 'failed'
          }
        }
      });
      
      return false;
    }
  }

  async sendPushNotification(alert, deviceTokens = []) {
    // Placeholder for push notification implementation
    // In a real app, you would integrate with Firebase Cloud Messaging or similar
    console.log(`📱 Push notification would be sent for ${alert.sensorId} - ${alert.parameter}`);
    
    // Simulate successful push notification
    await Alert.findByIdAndUpdate(alert._id, {
      $push: {
        notificationsSent: {
          type: 'push',
          recipient: deviceTokens.join(','),
          sentAt: new Date(),
          status: 'sent'
        }
      }
    });
    
    return true;
  }

  async sendWebhookAlert(alert, webhookUrl) {
    // Placeholder for webhook implementation
    console.log(`🔗 Webhook alert would be sent to ${webhookUrl} for ${alert.sensorId}`);
    
    await Alert.findByIdAndUpdate(alert._id, {
      $push: {
        notificationsSent: {
          type: 'webhook',
          recipient: webhookUrl,
          sentAt: new Date(),
          status: 'sent'
        }
      }
    });
    
    return true;
  }

  async processAlert(alert) {
    try {
      // Send email alert for danger level alerts
      if (alert.severity === 'danger') {
        await this.sendEmailAlert(alert);
      }

      // Send push notifications for all alerts
      await this.sendPushNotification(alert);

      // Send webhook for critical alerts
      if (alert.severity === 'danger') {
        await this.sendWebhookAlert(alert, 'https://your-webhook-url.com/alerts');
      }

      return true;
    } catch (error) {
      console.error('Error processing alert:', error);
      return false;
    }
  }

  async getActiveAlerts(limit = 50) {
    return await Alert.find({ resolved: false })
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  async acknowledgeAlert(alertId, acknowledgedBy) {
    return await Alert.findByIdAndUpdate(alertId, {
      acknowledged: true,
      acknowledgedBy: acknowledgedBy,
      acknowledgedAt: new Date()
    }, { new: true });
  }

  async resolveAlert(alertId) {
    return await Alert.findByIdAndUpdate(alertId, {
      resolved: true,
      resolvedAt: new Date()
    }, { new: true });
  }
}

module.exports = new AlertService();
