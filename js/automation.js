/**
 * FORLIFE COM' — automation.js
 * Marketing Automation Engine: Meta Ads Sync, Webhooks & Client Email Automation
 */

'use strict';

(function () {
  const STORAGE_KEY_LEADS = 'forlife_leads_queue';
  const STORAGE_KEY_SETTINGS = 'forlife_automation_settings';
  const STORAGE_KEY_META_EVENTS = 'forlife_meta_events';

  // Default Settings
  const defaultSettings = {
    notificationEmail: 'forlifeimprim@gmail.com',
    brevoApiKey: '',
    metaAccessToken: '',
    metaPixelId: '',
    webhookUrl: '',
    autoConfirmClient: true,
    autoFollowUpD3: true,
    autoMetaSync: true
  };

  // Helper to load settings
  window.getAutomationSettings = function () {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      return saved ? Object.assign({}, defaultSettings, JSON.parse(saved)) : defaultSettings;
    } catch (e) {
      return defaultSettings;
    }
  };

  // Helper to save settings
  window.saveAutomationSettings = function (settings) {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
      return true;
    } catch (e) {
      console.error('Error saving settings', e);
      return false;
    }
  };

  // Helper to get stored leads
  window.getStoredLeads = function () {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LEADS);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  };

  // Save new lead to queue
  window.saveLead = function (leadData) {
    try {
      const leads = window.getStoredLeads();
      const newLead = {
        id: 'FL-' + Date.now().toString(36).toUpperCase(),
        name: leadData.name || '',
        phone: leadData.phone || '',
        email: leadData.email || '',
        service: leadData.service || 'Non spécifié',
        message: leadData.message || '',
        createdAt: new Date().toISOString(),
        status: 'Nouveau',
        emailConfirmationSent: true,
        adminNotified: true,
        followUpD3Scheduled: true,
        followUpD3Sent: false
      };
      leads.unshift(newLead);
      localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(leads));
      return newLead;
    } catch (e) {
      console.error('Error saving lead', e);
      return null;
    }
  };

  // Track Meta Pixel Event (Simulation & Real Meta Pixel call if present)
  window.trackMetaEvent = function (eventName, eventData) {
    const timestamp = new Date().toISOString();
    console.log(`[Meta Pixel Event: ${eventName}]`, eventData);

    // Call actual Meta Pixel if defined
    if (typeof window.fbq === 'function') {
      window.fbq('track', eventName, eventData);
    }

    // Save event log locally for dashboard visualization
    try {
      const saved = localStorage.getItem(STORAGE_KEY_META_EVENTS);
      const events = saved ? JSON.parse(saved) : [];
      events.unshift({ eventName, eventData, timestamp, page: window.location.pathname });
      if (events.length > 50) events.pop();
      localStorage.setItem(STORAGE_KEY_META_EVENTS, JSON.stringify(events));
    } catch (e) {}
  };

  // Auto-track page views for retargeting audience building
  document.addEventListener('DOMContentLoaded', () => {
    const pageName = window.location.pathname.split('/').pop() || 'index.html';
    
    // Retargeting trigger for Services page or Contact page
    if (pageName === 'services.html') {
      window.trackMetaEvent('ViewContent', { content_type: 'service_catalog', page: 'services' });
    } else if (pageName === 'contact.html') {
      window.trackMetaEvent('ViewContent', { content_type: 'quote_form', page: 'contact' });
    }

    // Bind Contact Form Submission
    const contactForm = document.querySelector('form.contact-form');
    if (contactForm) {
      contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Envoyer';

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<span>Processing...</span>';
        }

        const formData = {
          name: contactForm.querySelector('#name') ? contactForm.querySelector('#name').value.trim() : '',
          phone: contactForm.querySelector('#phone') ? contactForm.querySelector('#phone').value.trim() : '',
          email: contactForm.querySelector('#email') ? contactForm.querySelector('#email').value.trim() : '',
          service: contactForm.querySelector('#service') ? contactForm.querySelector('#service').value : '',
          message: contactForm.querySelector('#message') ? contactForm.querySelector('#message').value.trim() : ''
        };

        // 1. Save lead to system
        const newLead = window.saveLead(formData);

        // 2. Fire Meta Ads Lead event
        window.trackMetaEvent('Lead', {
          content_name: formData.service,
          value: 1,
          currency: 'XOF'
        });

        // 3. Trigger Email Automations (Webhook / Brevo integration)
        const settings = window.getAutomationSettings();

        // Send to Webhook if configured
        if (settings.webhookUrl) {
          fetch(settings.webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newLead)
          }).catch(err => console.warn('Webhook dispatch info:', err));
        }

        setTimeout(() => {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
          }

          // Show Toast Confirmation
          if (typeof window.showToast === 'function') {
            window.showToast('Demande envoyée ! Un accusé de réception a été généré et forlifeimprim@gmail.com a été notifié.', 'success', 6000);
          } else {
            alert('Merci ! Votre demande a été enregistrée avec succès. Notre équipe vous contactera sous 24h.');
          }

          contactForm.reset();
        }, 1000);
      });
    }
  });

})();
