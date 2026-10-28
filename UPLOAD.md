# Putting taraksolutions.com online (free, with GitHub Pages)

The site is plain HTML, CSS and a little JavaScript. GitHub Pages hosts it for free with HTTPS.
Your domain stays at Hostinger; you only change its DNS records there.

## 1. Push this folder to GitHub

On github.com (signed in as deepak-r-fullstack), create a **public** repository named `taraksolutions-site`. Leave every box unticked. Then in Terminal:

```bash
cd ~/Documents/Develop/taraksolutions-site
rm -f .htaccess   # only needed for Hostinger hosting, not GitHub Pages
git init
git config user.name "Deepak Ravikumar"
git config user.email "ravideep1771@gmail.com"
git add .
git commit -m "Tarak Solutions homepage"
git branch -M master
git remote add origin https://github.com/deepak-r-fullstack/taraksolutions-site.git
git push -u origin master
```

## 2. Turn on GitHub Pages

Repository > **Settings** > **Pages**:
- Source: **Deploy from a branch**
- Branch: **master**, folder **/ (root)** > **Save**
- Custom domain: `taraksolutions.com` > **Save** (the `CNAME` file in this folder already says this)

## 3. Point the domain at GitHub (Hostinger)

hPanel > **Domains** > taraksolutions.com > **DNS / Nameservers** > **DNS records**.

1. Delete any existing **A** record named `@` and any **CNAME** named `www` (often a "parked" page).
2. Add four **A** records, Name `@`, one for each address:
   `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
3. Add one **CNAME** record: Name `www`, Points to `deepak-r-fullstack.github.io`

DNS changes can take from a few minutes to a few hours.

## 4. Turn on HTTPS

Back in **Settings** > **Pages**, when the domain check turns green, tick **Enforce HTTPS** (it can take up to a day to become available).

## Contact form

Until this is done, "Send message" opens the visitor's email app with the message filled in.

1. Go to https://web3forms.com, enter `deepakravikumar.dev@gmail.com`, and get your access key by email.
2. In `assets/main.js`, paste it: `const WEB3FORMS_ACCESS_KEY = "your-key-here";`
3. `git commit -am "Turn on contact form"` and `git push`. GitHub updates the site in about a minute.

## Add a new project later

In `index.html`, find the comment `Add the next project` and copy one `<li class="project-card">` block. Commit and push.
