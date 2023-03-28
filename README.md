# Product Static Bin Script

This script does the following actions.

1. Updates the StaticBin contentModel with a new slug field.
2. Goes through every entry for StaticBin, slugify the retailer name and then fills in the newly added slug field.

To run this script,

1. cd into generate-slug-script.
2. Run node index.js.

### config.json

1. accessToken - contentful access token (Generate your own accessToken).
2. space - contentful space information for targeted market.

- spaceId: contentful spaceId for required market
- environmentId: contentful environmentId for required market
- local: contentful local for required market (To find the local, click on Settings -> locales. You should see a default locale.)

3. contentType - contentful contentType to be used

- id: contentType id (can be found int the info tab for required contentType);
