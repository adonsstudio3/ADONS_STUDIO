# Google Tag Manager (GTM) Setup Guide

## 🚀 Installation Complete!

GTM has been successfully installed in your Next.js application with GDPR-compliant consent management.

## 📋 What's Been Added

### 1. Core Files
- `lib/gtm.js` - GTM utility functions and event tracking
- `components/ConsentProvider.js` - Consent management context
- `components/ConsentBanner.js` - GDPR consent banner UI
- `examples/gtm-usage-examples.js` - Usage examples for components

### 2. Updated Files
- `pages/_document.js` - GTM script and consent initialization
- `pages/_app.js` - Consent provider wrapper and page tracking
- `.env.local` - Environment variables for GTM ID

## ⚙️ Configuration Required

### Step 1: Get Your GTM Container ID
1. Go to [Google Tag Manager](https://tagmanager.google.com/)
2. Create a new container for your website
3. Copy your Container ID (format: GTM-XXXXXXX)

### Step 2: Update Environment Variables
Edit `.env.local`:
```bash
NEXT_PUBLIC_GTM_ID=GTM-YOUR-ACTUAL-ID
```

### Step 3: Restart Your Development Server
```bash
npm run dev
```

## 🎯 Features Included

### ✅ GDPR Compliance
- Default consent state: **DENIED** for all non-essential cookies
- User can choose "Accept All" or "Necessary Only"
- Consent preferences saved in localStorage
- Consent state synced with GTM

### ✅ Automatic Tracking
- **Page Views**: Tracked on route changes
- **Consent Events**: User consent decisions tracked

### ✅ Manual Event Tracking
All tracking functions available in `lib/gtm.js`:
- `trackButtonClick(buttonName, location)`
- `trackFormSubmission(formName, formData)`
- `trackVideoInteraction(action, videoTitle, currentTime)`
- `trackProjectView(projectName, projectCategory)`
- `trackContactAttempt(method, success)`
- `trackNewsletterSignup(email, source)`
- `trackScrollDepth(percentage)`
- `trackDownload(fileName, fileType)`

## 🔧 Usage Examples

### Track Button Clicks
```javascript
import { trackButtonClick } from '../lib/gtm';

const ContactButton = () => {
  const handleClick = () => {
    trackButtonClick('Contact CTA', 'Hero Section');
  };
  
  return <button onClick={handleClick}>Contact Us</button>;
};
```

### Track Form Submissions
```javascript
import { trackFormSubmission, trackContactAttempt } from '../lib/gtm';

const ContactForm = () => {
  const handleSubmit = async (formData) => {
    try {
      await submitForm(formData);
      trackFormSubmission('contact_form', { success: true });
      trackContactAttempt('contact_form', true);
    } catch (error) {
      trackContactAttempt('contact_form', false);
    }
  };
};
```

### Track Video Interactions
```javascript
import { trackVideoInteraction } from '../lib/gtm';

const VideoPlayer = ({ videoTitle }) => {
  return (
    <video
      onPlay={() => trackVideoInteraction('play', videoTitle)}
      onPause={() => trackVideoInteraction('pause', videoTitle)}
      onEnded={() => trackVideoInteraction('complete', videoTitle)}
    >
      <source src="video.mp4" type="video/mp4" />
    </video>
  );
};
```

## 📊 GTM Container Setup

### Recommended Tags to Create in GTM:

1. **Google Analytics 4**
   - Trigger: Page View + Consent Update
   - Consent: Analytics Storage = Granted

2. **Custom Events**
   - Trigger: Custom Event (user_interaction, form_submit, etc.)
   - Use event parameters for detailed tracking

3. **Conversion Tracking**
   - Track form submissions as conversions
   - Track specific button clicks as goals

### Variables to Create:
- Page Path: `{{Page Path}}`
- Page Title: `{{Page Title}}`
- Event Action: `{{Event - action}}`
- Form Name: `{{Event - form_name}}`
- Button Name: `{{Event - button_name}}`

## 🎨 Consent Banner Customization

The consent banner in `components/ConsentBanner.js` can be customized:
- Colors match your brand
- Text can be modified
- Animation timing adjustable
- Position can be changed (currently bottom)

## 🔒 Privacy Compliance

### GDPR Features:
- ✅ Consent required before tracking
- ✅ Easy opt-out mechanism
- ✅ Granular consent options
- ✅ Consent preferences stored locally
- ✅ Consent state communicated to GTM

### Data Collected:
- Only with user consent
- Page views and navigation
- User interactions (clicks, form submissions)
- Video engagement
- File downloads

## 🚀 Next Steps

1. **Set up your GTM Container ID** in `.env.local`
2. **Configure GTM tags** for Google Analytics, Facebook Pixel, etc.
3. **Add tracking calls** to your existing components
4. **Test consent banner** and tracking in browser dev tools
5. **Verify data** is flowing to your analytics platforms

## 🧪 Testing

### Browser Dev Tools
1. Open Developer Tools
2. Go to Console tab
3. Look for `dataLayer` pushes
4. Test consent banner functionality

### GTM Preview Mode
1. In GTM, click "Preview"
2. Enter your site URL
3. Test all tracking events
4. Verify consent states

## 📈 Analytics Integration

Your GTM setup is ready for:
- **Google Analytics 4** (GA4)
- **Facebook Pixel**
- **Google Ads Conversion Tracking**
- **LinkedIn Insight Tag**
- **Custom analytics platforms**

Just add the appropriate tags in your GTM container and they'll respect the user's consent choices!

---

🎉 **GTM Installation Complete!** 
Update your `.env.local` with your GTM ID and start tracking user interactions!