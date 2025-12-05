# Earn9ja Legal Documents

This folder contains all legal documents for the Earn9ja mobile application.

## Documents Included

### 1. Privacy Policy (`privacy-policy.md`)

Explains how we collect, use, store, and protect user data. Covers:

- Information collection
- Data usage and sharing
- Security measures
- User rights under NDPR
- Contact information

### 2. Terms of Service (`terms-of-service.md`)

Defines the rules and guidelines for using Earn9ja. Covers:

- Eligibility requirements
- Account registration and KYC
- Earning and withdrawal rules
- Prohibited activities
- Dispute resolution
- Liability limitations

### 3. Data Protection Policy (`data-protection.md`)

Details our compliance with Nigeria Data Protection Regulation (NDPR). Covers:

- Legal framework
- Data processing principles
- Data subject rights
- Security measures
- Data retention
- International transfers

## Compliance

These documents ensure compliance with:

- ✅ Nigeria Data Protection Regulation (NDPR) 2019
- ✅ Nigeria Data Protection Bureau (NDPB) Guidelines
- ✅ Google Play Store requirements
- ✅ Apple App Store requirements
- ✅ Payment processor requirements (Paystack, Flutterwave)
- ✅ Advertising partner requirements (CPAGrip, AdGem, OGAds, BitLabs)

## Hosting Options

### Option 1: GitHub Pages (Recommended)

- **Cost:** Free
- **Setup:** See `GITHUB_PAGES_SETUP.md`
- **URL Format:** `https://username.github.io/earn9ja-legal/privacy-policy`
- **Benefits:** Free, HTTPS, version control, easy updates

### Option 2: Your Own Website

- Host on your domain: `https://earn9ja.com/legal/privacy-policy`
- Requires web hosting

### Option 3: Third-Party Services

- **Termly:** https://termly.io (free tier available)
- **TermsFeed:** https://www.termsfeed.com (free generator)
- **iubenda:** https://www.iubenda.com (paid)

## Customization Required

Before publishing, update these placeholders:

### In All Documents:

- `[email protected]` → Your actual email
- `[Your Business Address]` → Your physical address
- `[Your Phone Number]` → Your contact number
- `[Your Business Registration Number]` → Your CAC number (if registered)
- `[DPO Name]` → Your Data Protection Officer's name

### URLs to Update:

- Replace `YOUR_USERNAME` with your GitHub username
- Update all example URLs with your actual URLs

## Integration with App

### Add to Constants

```typescript
// Earn9ja/constants/legal.ts
export const LEGAL_URLS = {
  privacyPolicy: "https://YOUR_USERNAME.github.io/earn9ja-legal/privacy-policy",
  termsOfService:
    "https://YOUR_USERNAME.github.io/earn9ja-legal/terms-of-service",
  dataProtection:
    "https://YOUR_USERNAME.github.io/earn9ja-legal/data-protection",
};
```

### Display in App

```typescript
import { Linking } from "react-native";
import { LEGAL_URLS } from "../constants/legal";

// Open document
const openLegalDocument = (url: string) => {
  Linking.openURL(url);
};

// Usage
<TouchableOpacity onPress={() => openLegalDocument(LEGAL_URLS.privacyPolicy)}>
  <Text>Privacy Policy</Text>
</TouchableOpacity>;
```

### Add to Registration Flow

```typescript
// During registration
<View>
  <Text>
    By registering, you agree to our{" "}
    <Text
      style={styles.link}
      onPress={() => openLegalDocument(LEGAL_URLS.termsOfService)}
    >
      Terms of Service
    </Text>{" "}
    and{" "}
    <Text
      style={styles.link}
      onPress={() => openLegalDocument(LEGAL_URLS.privacyPolicy)}
    >
      Privacy Policy
    </Text>
  </Text>
</View>
```

## App Store Requirements

### Google Play Store

1. Go to Play Console → App content → Privacy policy
2. Add URL: `https://YOUR_USERNAME.github.io/earn9ja-legal/privacy-policy`
3. Save

### Apple App Store

1. Go to App Store Connect → App Information
2. Privacy Policy URL: `https://YOUR_USERNAME.github.io/earn9ja-legal/privacy-policy`
3. Terms of Service URL: `https://YOUR_USERNAME.github.io/earn9ja-legal/terms-of-service`
4. Save

## Maintenance

### When to Update

Update these documents when:

- ✅ You add new features that collect data
- ✅ You integrate new third-party services
- ✅ Laws or regulations change
- ✅ Your business practices change
- ✅ You expand to new countries

### How to Update

1. Edit the Markdown files
2. Update "Last Updated" date
3. Commit changes to GitHub
4. Notify users of significant changes (in-app notification)

### Version Control

- Keep old versions in Git history
- Document major changes in commit messages
- Consider adding a "Changes" section for transparency

## Legal Review

⚠️ **Important:** While these documents are comprehensive, consider having them reviewed by a Nigerian lawyer familiar with:

- Data protection law (NDPR)
- Consumer protection
- E-commerce regulations
- Employment law (if applicable)

## Contact for Legal Matters

**General Inquiries:**  
Email: [email protected]

**Data Protection Officer:**  
Email: [email protected]

**Nigeria Data Protection Bureau:**  
Website: https://ndpb.gov.ng  
Email: [email protected]  
Phone: +234 (0) 9-461-3858

## Checklist

Before going live, ensure:

- [ ] All placeholders replaced with actual information
- [ ] Documents uploaded to GitHub Pages
- [ ] URLs tested and working
- [ ] Links added to mobile app
- [ ] URLs added to app store listings
- [ ] Users can access documents from app
- [ ] "Last Updated" dates are current
- [ ] Contact information is correct
- [ ] Documents reviewed by legal counsel (recommended)

## Resources

- **NDPR Full Text:** https://ndpb.gov.ng/ndpr/
- **NDPB Guidelines:** https://ndpb.gov.ng/guidelines/
- **GitHub Pages Docs:** https://docs.github.com/pages
- **Markdown Guide:** https://www.markdownguide.org/

---

**Document Set Version:** 1.0  
**Created:** January 2, 2025  
**For:** Earn9ja Mobile Application  
**Compliance:** NDPR 2019, Nigerian Law
