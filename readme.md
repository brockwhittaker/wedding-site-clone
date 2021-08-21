# Basics

This was intended to be a front-end only solution so that it could run as a static site (I ran on Render). It uses Airtable as an API to POST reservation info to. It's pretty bespoke and pretty quickly built, so while there are some generics, most isn't and is pretty crudely written.

# Get it running
Download the basics – parcel & npm packages.
```
npm i -g parcel-bundler
npm i
```

Run the dev server by running

```
cd frontend/
parcel index.html
```

Run and output to static directory for build

```
cd frontend/
parcel build index.html
```

# Log in as a user
In `rsvp-list.js` there is an entry **test@example.com**.