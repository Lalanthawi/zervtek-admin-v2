import { faker } from '@faker-js/faker'
import { auctions } from '@/features/auctions/data/auctions'

faker.seed(78901)

export interface RequestThread {
  id: string
  sender: string
  senderType: 'customer' | 'admin'
  message: string
  attachments?: {
    id: string
    name: string
    size: number
    type: string
    url: string
  }[]
  timestamp: Date
}

export interface RequestDocument {
  id: string
  name: string
  type: string
  size: number
  uploadedBy: string
  uploadedAt: Date
  url: string
}

export interface InspectionMedia {
  id: string
  type: 'image' | 'video'
  url: string
  thumbnail?: string
  note?: string
  uploadedBy: string
  uploadedAt: Date
}

export interface InspectionNote {
  id: string
  note: string
  addedBy: string
  addedAt: Date
}

export interface ServiceRequest {
  id: string
  requestId: string
  type: 'inspection' | 'translation'
  title: string
  description: string
  customerId: string
  customerName: string
  customerEmail: string
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignedTo?: string
  assignedToName?: string
  assignedToEmail?: string
  estimatedTime?: string
  estimatedCompletionTime?: Date
  completedAt?: Date
  vehicleInfo?: {
    make: string
    model: string
    year: number
    vin?: string
  }
  auctionId?: string // Link to auction for translation requests
  sourceLanguage?: string
  targetLanguage?: string
  documentType?: string
  attachments: string[]
  documents?: RequestDocument[]
  threads: RequestThread[]
  notes?: string
  price?: number
  createdAt: Date
  updatedAt: Date
  // Inspection specific fields
  inspectionMedia?: InspectionMedia[]
  inspectionNotes?: InspectionNote[]
}

const makes = ['Toyota', 'Honda', 'BMW', 'Mercedes-Benz', 'Audi', 'Nissan', 'Lexus', 'Porsche']
const models: Record<string, string[]> = {
  'Toyota': ['Camry', 'Land Cruiser', 'Supra', 'RAV4', 'Corolla'],
  'Honda': ['Accord', 'NSX', 'Pilot', 'CR-V', 'Civic'],
  'BMW': ['5 Series', 'X5', 'M3', '3 Series', 'X3'],
  'Mercedes-Benz': ['E-Class', 'S-Class', 'G-Class', 'C-Class', 'AMG GT'],
  'Audi': ['A6', 'Q7', 'RS5', 'A4', 'Q5'],
  'Nissan': ['GT-R', 'Patrol', 'Altima', '370Z'],
  'Lexus': ['LX', 'LC', 'RX', 'IS', 'ES'],
  'Porsche': ['911', 'Cayenne', 'Macan', 'Panamera'],
}
const languages = ['Japanese', 'Korean', 'German', 'French', 'Spanish', 'Chinese', 'Arabic', 'Russian']
const documentTypes = ['Auction Sheet', 'Service Records', 'Import Documents', 'Registration Papers', 'Inspection Report', 'Title Certificate']
const inspectionTypes = ['Full Inspection', 'Pre-purchase Check', 'Performance Inspection', 'Condition Report', 'Detailed Report']
const translationTypes = ['Auction Sheet Translation', 'Export Certificate Translation']

const customerNames = [
  'John Smith', 'Sarah Wilson', 'Mike Davis', 'Emily Johnson', 'Robert Brown',
  'Lisa Garcia', 'David Lee', 'Amy Chen', 'Chris Taylor', 'Jennifer Martinez',
  'James Wilson', 'Maria Rodriguez', 'Daniel Kim', 'Rachel Thompson', 'Andrew Clark'
]

const adminNames = [
  'Mike Johnson', 'Sarah Admin', 'Tom Support', 'Jessica Handler', 'Kevin Manager'
]

const fileTypes = ['application/pdf', 'image/jpeg', 'image/png']
const fileNames = ['auction_sheet.pdf', 'vehicle_photos.zip', 'inspection_report.pdf', 'document.pdf', 'certificate.pdf']

const inspectionNoteTexts = [
  'Vehicle exterior is in excellent condition with no visible damage.',
  'Minor scratches on the rear bumper, approximately 2cm.',
  'Engine bay is clean with no signs of oil leaks.',
  'Tires show approximately 60% tread remaining.',
  'Interior is well maintained with minimal wear.',
  'All electrical components tested and working properly.',
  'Undercarriage inspection shows no rust or corrosion.',
  'Brakes checked - front pads at 70%, rear at 80%.',
  'Suspension components in good working order.',
  'AC system blowing cold air as expected.',
]

// Track auction index for translation requests to ensure variety
let translationAuctionIndex = 0

export const requests: ServiceRequest[] = Array.from({ length: 120 }, (_, index) => {
  const type = faker.helpers.arrayElement(['inspection', 'translation']) as 'inspection' | 'translation'
  const customerName = faker.helpers.arrayElement(customerNames)
  const assigneeName = faker.helpers.maybe(() => faker.helpers.arrayElement(adminNames))
  const status = faker.helpers.arrayElement(['pending', 'assigned', 'in_progress', 'completed', 'cancelled'] as const)

  // For translation requests, link to an auction
  const linkedAuction = type === 'translation' ? auctions[translationAuctionIndex++ % auctions.length] : null

  const make = linkedAuction?.vehicleInfo.make || faker.helpers.arrayElement(makes)
  const model = linkedAuction?.vehicleInfo.model || faker.helpers.arrayElement(models[make] || ['Model'])
  const year = linkedAuction?.vehicleInfo.year || faker.number.int({ min: 2015, max: 2024 })

  // Generate threads
  const threadCount = faker.number.int({ min: 1, max: 5 })
  const threads: RequestThread[] = Array.from({ length: threadCount }, (_, tIndex) => {
    const isAdmin = tIndex % 2 === 1
    const sender = isAdmin ? faker.helpers.arrayElement(adminNames) : customerName

    return {
      id: faker.string.uuid(),
      sender,
      senderType: (isAdmin ? 'admin' : 'customer') as 'admin' | 'customer',
      message: faker.lorem.sentences({ min: 1, max: 3 }),
      attachments: tIndex === 0 && !isAdmin ? [{
        id: faker.string.uuid(),
        name: faker.helpers.arrayElement(fileNames),
        size: faker.number.int({ min: 100000, max: 5000000 }),
        type: faker.helpers.arrayElement(fileTypes),
        url: '#',
      }] : undefined,
      timestamp: faker.date.recent({ days: 30 - tIndex * 5 }),
    }
  }).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())

  // Generate documents
  const documents: RequestDocument[] = faker.helpers.maybe(() =>
    Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => ({
      id: faker.string.uuid(),
      name: faker.helpers.arrayElement(fileNames),
      type: faker.helpers.arrayElement(fileTypes),
      size: faker.number.int({ min: 100000, max: 5000000 }),
      uploadedBy: faker.helpers.arrayElement([customerName, ...adminNames]),
      uploadedAt: faker.date.recent({ days: 14 }),
      url: '#',
    }))
  ) || []

  const basePrice = type === 'inspection' ? faker.number.int({ min: 100, max: 300 }) : faker.number.int({ min: 30, max: 100 })

  // Generate title with vehicle info for translations
  const translationType = faker.helpers.arrayElement(translationTypes)
  const title = type === 'inspection'
    ? `${faker.helpers.arrayElement(inspectionTypes)} - ${make} ${model}`
    : `${translationType} - ${year} ${make} ${model}`

  // Generate inspection media for inspection requests (only for in_progress or completed)
  const inspectionMedia: InspectionMedia[] = type === 'inspection' && (status === 'in_progress' || status === 'completed')
    ? Array.from({ length: faker.number.int({ min: 3, max: 8 }) }, () => ({
        id: faker.string.uuid(),
        type: faker.helpers.arrayElement(['image', 'image', 'image', 'video']) as 'image' | 'video',
        url: faker.image.urlLoremFlickr({ category: 'car' }),
        thumbnail: faker.image.urlLoremFlickr({ category: 'car', width: 150, height: 100 }),
        note: faker.helpers.maybe(() => faker.helpers.arrayElement(inspectionNoteTexts)),
        uploadedBy: faker.helpers.arrayElement(adminNames),
        uploadedAt: faker.date.recent({ days: 7 }),
      }))
    : []

  // Generate inspection notes for inspection requests
  const inspectionNotes: InspectionNote[] = type === 'inspection' && (status === 'in_progress' || status === 'completed')
    ? Array.from({ length: faker.number.int({ min: 1, max: 4 }) }, () => ({
        id: faker.string.uuid(),
        note: faker.helpers.arrayElement(inspectionNoteTexts),
        addedBy: faker.helpers.arrayElement(adminNames),
        addedAt: faker.date.recent({ days: 7 }),
      })).sort((a, b) => a.addedAt.getTime() - b.addedAt.getTime())
    : []

  return {
    id: faker.string.uuid(),
    requestId: `REQ-${new Date().getFullYear()}-${String(index + 1).padStart(4, '0')}`,
    type,
    title,
    description: faker.lorem.sentence(),
    customerId: faker.string.uuid(),
    customerName,
    customerEmail: faker.internet.email({ firstName: customerName.split(' ')[0], lastName: customerName.split(' ')[1] }).toLowerCase(),
    status,
    priority: faker.helpers.arrayElement(['low', 'medium', 'high', 'urgent'] as const),
    assignedTo: assigneeName ? faker.string.uuid() : undefined,
    assignedToName: assigneeName ?? undefined,
    assignedToEmail: assigneeName ? faker.internet.email().toLowerCase() : undefined,
    estimatedTime: faker.helpers.maybe(() => `${faker.number.int({ min: 15, max: 120 })} min`),
    estimatedCompletionTime: status === 'in_progress' || status === 'assigned'
      ? faker.date.soon({ days: 7 })
      : undefined,
    completedAt: status === 'completed' ? faker.date.past() : undefined,
    vehicleInfo: {
      make,
      model,
      year,
      vin: linkedAuction?.vehicleInfo.vin || faker.vehicle.vin(),
    },
    auctionId: linkedAuction?.id,
    sourceLanguage: type === 'translation' ? 'Japanese' : undefined,
    targetLanguage: type === 'translation' ? 'English' : undefined,
    documentType: type === 'translation' ? faker.helpers.arrayElement(documentTypes) : undefined,
    attachments: [...(faker.helpers.maybe(() => [faker.image.url()]) || [])],
    documents,
    threads,
    notes: faker.helpers.maybe(() => faker.lorem.sentence()),
    price: basePrice,
    createdAt: faker.date.past({ years: 1 }),
    updatedAt: faker.date.recent({ days: 7 }),
    inspectionMedia: inspectionMedia.length > 0 ? inspectionMedia : undefined,
    inspectionNotes: inspectionNotes.length > 0 ? inspectionNotes : undefined,
  }
}).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
