/**
 * A physical location.
 */
class Property {
  // user info
  favorite = false
  notes = ''

  // property info
  propertyId = 0
  image = ''
  url = ''
  address = ''
  city = ''
  state = ''
  zip = ''
  county = ''
  lat = 0
  lon = 0
  // TODO make enum of types (see Realtor.com "Property Type" filter)
  type = ''
  year = 0
  beds = 0
  baths = 0
  mlsNumber = ''
  sqft = 0
  lotAcres = 0
}

export default Property
