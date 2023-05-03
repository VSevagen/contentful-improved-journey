const contentful = require('contentful-management');
const config = require("./config.json");
const log = require("./utils/log");
var slugify = require('slug-generator');

const ACCESS_TOKEN = config.accessToken;
const SPACEID = config.space.spaceId
const ENVIRONMENTID = config.space.environmentId;
const CONTENT_TYPE = config.contentType.id;
const LOCAL = config.space.locale;

const client = contentful.createClient({
  accessToken: ACCESS_TOKEN
});

/**
 * updateAppearance
 * @param {*} environment 
 * @returns 
 * status concerning whether fieldAppearance has been updated
 */
const updateAppearance = async (environment) => {
  try {
    if(environment) {
      let fieldAppearance = await environment.getEditorInterfaceForContentType(CONTENT_TYPE);
      fieldAppearance.controls[3] = {
        fieldId: 'slug',
        widgetId: 'slugEditor',
        widgetNamespace: 'builtin',
      }
      return await fieldAppearance.update();
    }
  } catch(err) {
    log(`Error occured on updateAppearance step `, err);
  }
}

/**
 * updateContentType
 * @param {*} space 
 * @param {*} environment 
 * @returns 
 * status concerning whether newEntry has been published
 */
const updateContentType = async (space, environment) => {
  try {
    let contentType = await environment.getContentType(CONTENT_TYPE);
    if(contentType) {
      const newField = {
        id: "slug",
        name: "slug",
        required: false,
        type: "Symbol"
      }
      contentType.fields.push(newField);
      let newEntry = await contentType.update();
      return await newEntry.publish();
    }
  } catch(err) {
    log(`Error occured on updateContentType step `, err);
  }
}

/**
 * updateEntry
 * @param {*} entry 
 * @returns 
 * publishedEntry for case of entry with status "Published"
 * nothing for case of entry with stats "Draft or Changed"
 */
const updateEntry = async (entry) => {
  try {
    if(!entry.isArchived()) {
      entry.fields['slug'] = {
        [LOCAL] :'New entry description'
      };
      
      entry.fields.slug[LOCAL] = entry?.fields?.retailerName?.[LOCAL] ? slugify(entry?.fields?.retailerName?.[LOCAL]) : "";
      
      let updatedEntry = await entry.update();

      //if state="changed" return;
      if(entry.isUpdated()) {
        return;
      }

      if(entry.isPublished()) {
        let publishedEntry = await updatedEntry.publish();
        log(`Published ${publishedEntry?.fields?.retailerName[LOCAL]} id=${publishedEntry?.sys?.id}`)
        return publishedEntry;
      }
    }
  } catch (err) {
    log(`Error occured on updateEntry step ${entry?.sys?.id}`);
  }
}


const run = async () => {
  try {
    log(`DATE: ${new Date()}`);
    // Get contentful space
    let space = await client.getSpace(SPACEID);
    // Get contentful environment
    let environment = await space.getEnvironment(ENVIRONMENTID);

    // Update contentmodel with new slug field
    const updateContentModel = await updateContentType(space, environment);

    // Change the appearance of newly added field to slug appearance
    const updateAppeance = await updateAppearance(environment);

    // Populate new field with value
    if(updateContentModel && updateAppeance) {
      const entries = await environment.getEntries({'content_type': CONTENT_TYPE, limit: 1000})
      for(entry of entries.items) {
        let item = await updateEntry(entry);
      }
    }

  } catch(err) {
    log(`Error occured on run step `, err);
  }
}

run();