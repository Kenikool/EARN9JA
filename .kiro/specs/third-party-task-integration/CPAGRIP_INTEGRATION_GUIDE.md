# CPAGrip Integration Guide

## What CPAGrip Actually Offers

CPAGrip is primarily a **content locker** and **offer wall** platform, not a traditional API-based task provider. Here's what you need to know:

## CPAGrip Integration Methods

### Method 1: Content Locker (Easiest - Start Here)

**What it is:** Users complete offers (surveys, app installs, etc.) to unlock content in your app.

**How to find your credentials:**

1. Log into CPAGrip dashboard
2. Go to **"Lockers"** or **"Tools"** section
3. Create a new locker or select existing one
4. You'll see an **iframe code** or **direct link** like:
   ```
   https://www.cpagrip.com/show.php?l=0&u=YOUR_USER_ID&id=LOCKER_ID
   ```
5. Extract:
   - `YOUR_USER_ID` - This is your publisher ID
   - `LOCKER_ID` - This is your locker ID

**Integration:**

- Open the locker URL in a WebView inside your app
- Users complete offers
- You get paid when they complete

### Method 2: Offer Wall (Better for Task Integration)

**How to find it:**

1. Dashboard → **"Offer Walls"** or **"API"** section
2. Look for **"Postback URL"** settings
3. You might see options like:
   - Postback URL (for tracking conversions)
   - Offer feed URL
   - Widget code

**What to look for:**

- **Postback URL:** Where CPAGrip sends conversion notifications
- **User ID Parameter:** How you track which user completed an offer
- **Conversion tracking:** How you verify completions

### Method 3: Direct Link (Simplest)

**How it works:**

1. Dashboard → **"Links"** or **"Campaigns"**
2. Get your referral link
3. Append user tracking parameter
4. Example: `https://www.cpagrip.com/show.php?l=0&u=12345&id=67890&subid={USER_ID}`

## What You Should Do Right Now

### Step 1: Check Your Dashboard Sections

Look for these sections in your CPAGrip dashboard:

- [ ] **Lockers** - Content locking tools
- [ ] **Offer Walls** - List of available offers
- [ ] **API** or **Developer** - Technical integration
- [ ] **Postback** - Conversion tracking
- [ ] **Links** - Direct referral links
- [ ] **Tools** - Integration widgets

### Step 2: Find Your Publisher/User ID

This is usually visible in:

- Top right corner of dashboard
- Account settings
- Any generated link (the `u=` parameter)

### Step 3: Choose Integration Method

**For Earn9ja, I recommend:**

#### Option A: WebView Integration (Fastest)

```typescript
// Show CPAGrip offers in a WebView
const cpagripUrl = `https://www.cpagrip.com/show.php?l=0&u=YOUR_ID&id=LOCKER_ID&subid=${userId}`;

// In React Native:
<WebView
  source={{ uri: cpagripUrl }}
  onNavigationStateChange={handleCompletion}
/>;
```

**Pros:**

- Works immediately
- No API needed
- CPAGrip handles everything

**Cons:**

- Less control over UI
- Can't filter specific offers
- Users leave your app experience

#### Option B: Postback Integration (Better)

```typescript
// 1. Set up postback URL in CPAGrip dashboard:
// https://yourdomain.com/api/cpagrip/postback?user={subid}&amount={payout}

// 2. Create endpoint to receive conversions:
app.post("/api/cpagrip/postback", async (req, res) => {
  const { user, amount, offer_id } = req.query;

  // Verify request is from CPAGrip (check IP or secret key)
  // Credit user's wallet
  await creditUser(user, amount);

  res.send("OK");
});

// 3. Show offers via iframe/webview with tracking
```

**Pros:**

- Automatic conversion tracking
- Real-time crediting
- Better user experience

**Cons:**

- Requires backend setup
- Need public domain for postback

## Alternative: Use CPAGrip's Offer Feed

Some CPA networks provide an offer feed. Check if CPAGrip has:

1. **JSON/XML Feed URL** - List of available offers
2. **Offer Details** - Title, description, payout
3. **Tracking Links** - Unique URLs per user

If they have this, you can:

- Fetch offers programmatically
- Display them natively in your app
- Track conversions via postback

## Recommended Approach for Earn9ja

Since you're just starting, here's the pragmatic path:

### Phase 1: Quick Start (This Week)

1. Use **Content Locker** or **Offer Wall** via WebView
2. Embed CPAGrip URL in your app
3. Track conversions manually via CPAGrip dashboard
4. Pay users based on dashboard reports

### Phase 2: Automation (Next Week)

1. Set up **Postback URL** on your backend
2. Automatic conversion tracking
3. Real-time wallet crediting
4. Better user experience

### Phase 3: Native Integration (Later)

1. If CPAGrip provides offer feed API, use it
2. Display offers natively in your app
3. Full control over UI/UX

## What Information to Get from CPAGrip

Contact CPAGrip support or check documentation for:

1. **Publisher ID** - Your unique identifier
2. **Postback URL format** - How they send conversions
3. **Offer feed** - Do they provide a JSON/XML feed?
4. **Tracking parameters** - How to pass user IDs
5. **Conversion verification** - How to verify legitimate completions
6. **Payout details** - When and how you get paid

## Next Steps

1. **Explore your CPAGrip dashboard** - Find what integration options they offer
2. **Check their documentation** - Look for "API", "Integration", or "Developer" docs
3. **Contact support** - Ask: "How can I integrate CPAGrip offers into my mobile app?"
4. **Start simple** - Use WebView integration first, optimize later

## Example: Simple CPAGrip Integration

```typescript
// backend/src/services/CPAGripService.ts
export class CPAGripService {
  private publisherId = process.env.CPAGRIP_PUBLISHER_ID;
  private lockerId = process.env.CPAGRIP_LOCKER_ID;

  // Generate offer URL for user
  getOfferUrl(userId: string): string {
    return `https://www.cpagrip.com/show.php?l=0&u=${this.publisherId}&id=${this.lockerId}&subid=${userId}`;
  }

  // Handle postback from CPAGrip
  async handleConversion(data: {
    subid: string; // Your user ID
    payout: number; // Amount earned
    offer_id: string;
    status: string;
  }): Promise<void> {
    if (data.status === "completed") {
      // Credit user
      await this.creditUser(data.subid, data.payout);

      // Log conversion
      await Conversion.create({
        userId: data.subid,
        providerId: "cpagrip",
        offerId: data.offer_id,
        amount: data.payout,
        status: "completed",
      });
    }
  }

  private async creditUser(userId: string, amount: number): Promise<void> {
    const wallet = await Wallet.findOne({ userId });
    wallet.balance += amount;
    await wallet.save();
  }
}
```

## Common CPAGrip Dashboard Locations

Look for these in your dashboard:

- **"My Lockers"** - Content locker tools
- **"Offer Walls"** - Available offers
- **"Postback Settings"** - Conversion tracking setup
- **"API Documentation"** - Technical docs (if available)
- **"Statistics"** - Track your earnings
- **"Payment Settings"** - Payout configuration

## Questions to Answer

Before we proceed with implementation, find out:

1. ✅ Do you have a CPAGrip account? **YES**
2. ❓ Can you see "Lockers" or "Offer Walls" in your dashboard?
3. ❓ Is there an "API" or "Developer" section?
4. ❓ Can you create a content locker and get a link?
5. ❓ Do you see a "Postback URL" setting anywhere?

Once you answer these, I'll help you implement the right integration method!

---

**TL;DR:** CPAGrip likely doesn't have a traditional REST API. You'll probably integrate via:

1. **WebView** (show their offers in your app)
2. **Postback URL** (they notify you of conversions)
3. **Manual tracking** (check dashboard for earnings)

Let me know what you find in your dashboard!
