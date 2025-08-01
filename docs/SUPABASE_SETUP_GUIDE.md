# Supabase Setup Guide for HRM System

This guide will help you set up Supabase for file storage in your HRM system, providing secure and scalable cloud storage for all file uploads.

## 🚀 Features

- **Secure Storage**: All files stored securely on Supabase Storage
- **Public URLs**: Direct access to files via public URLs
- **File Management**: Easy upload, download, and deletion of files
- **Multiple Buckets**: Organized storage for different file types
- **Authentication**: Integrated with Supabase Auth for secure access

## 📋 Prerequisites

- Node.js 16+ installed
- A Supabase account (free tier available)
- Basic knowledge of environment variables

## 🛠️ Setup Instructions

### Step 1: Create Supabase Project

1. Go to [Supabase](https://supabase.com/) and create a free account
2. Create a new project
3. Wait for the project to be fully set up (usually takes 2-3 minutes)

### Step 2: Get Your Credentials

From your Supabase Dashboard, go to Settings > API and copy these values:

- **Project URL**: Your unique Supabase URL
- **Anon Key**: Public anonymous key
- **Service Role Key**: Private service role key (for server-side operations)

### Step 3: Configure Environment Variables

Add these variables to your `.env` file:

```env
# Supabase Configuration
SUPABASE_URL=your_project_url_here
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Example:**
```env
SUPABASE_URL=https://abcdefghijklmnop.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 4: Create Storage Buckets

In your Supabase Dashboard, go to Storage and create the following buckets:

1. **profile-photos** - For user profile pictures
2. **documents** - For general documents
3. **resumes** - For job application resumes
4. **leave-documents** - For leave request attachments
5. **ticket-attachments** - For support ticket files
6. **chat-attachments** - For chat message files
7. **offer-letters** - For job offer letters
8. **holiday-excel** - For holiday calendar files

### Step 5: Configure Bucket Policies

For each bucket, set up the appropriate RLS (Row Level Security) policies:

#### Public Buckets (for public access):
- `profile-photos`
- `documents`
- `resumes`

#### Private Buckets (for authenticated users only):
- `leave-documents`
- `ticket-attachments`
- `chat-attachments`
- `offer-letters`
- `holiday-excel`

**Example Policy for Public Read Access:**
```sql
-- Allow public read access
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-photos');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated upload" ON storage.objects
FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND bucket_id = 'profile-photos');
```

## 📁 File Organization

Your files will be organized in Supabase Storage as follows:

```
profile-photos/
├── profile_user1_timestamp_filename.jpg
├── profile_user2_timestamp_filename.png
└── ...

documents/
├── doc_user1_timestamp_filename.pdf
├── doc_user2_timestamp_filename.docx
└── ...

resumes/
├── resume_applicant_timestamp_filename.pdf
└── ...

leave-documents/
├── leave_user1_timestamp_filename.pdf
└── ...

ticket-attachments/
├── ticket_user1_timestamp_filename.pdf
└── ...

chat-attachments/
├── chat_user1_timestamp_filename.jpg
└── ...

offer-letters/
├── offer_timestamp_filename.pdf
└── ...

holiday-excel/
├── holidays_user1_timestamp_filename.xlsx
└── ...
```

## 🔧 Configuration Details

### File Size Limits
- Profile photos: 5MB
- Documents: 10MB
- Resumes: 5MB
- Leave documents: 5MB
- Ticket attachments: 5MB
- Chat attachments: 10MB
- Offer letters: 10MB
- Holiday excel: 10MB

### Supported File Types

#### Profile Photos
- JPEG, JPG, PNG, GIF

#### Documents
- PDF, JPEG, JPG, PNG, DOC, DOCX

#### Resumes
- PDF, DOC, DOCX

#### Leave Documents
- PDF, JPEG, JPG, PNG

#### Ticket Attachments
- PDF, JPEG, JPG, PNG, DOC, DOCX, TXT

#### Chat Attachments
- PDF, JPEG, JPG, PNG, GIF, DOC, DOCX, XLS, XLSX, TXT, ZIP, RAR

#### Offer Letters
- PDF only

#### Holiday Excel
- XLSX, XLS, CSV

## 🚀 Getting Started

1. **Set up your Supabase project** following the steps above
2. **Add environment variables** to your `.env` file
3. **Create storage buckets** in your Supabase dashboard
4. **Configure bucket policies** for proper access control
5. **Restart your application** to load the new configuration

## 🔍 Testing Your Setup

After setup, you can test file uploads by:

1. **Profile Photo Upload**: Try uploading a profile photo through the user profile page
2. **Document Upload**: Upload a document through the profile documents section
3. **Resume Upload**: Test job application with resume upload

## 📈 Benefits of Supabase Storage

1. **Scalability**: Automatically scales with your application
2. **Security**: Built-in authentication and authorization
3. **Performance**: Global CDN for fast file delivery
4. **Cost-effective**: Pay only for what you use
5. **Integration**: Seamless integration with Supabase Auth and Database

## 🛠️ Troubleshooting

### Common Issues

1. **Files not uploading**
   - Check your environment variables
   - Verify bucket exists and has correct policies
   - Check file size and type restrictions

2. **Access denied errors**
   - Review your RLS policies
   - Ensure proper authentication
   - Check service role key permissions

3. **Files not accessible**
   - Verify bucket is public if needed
   - Check file URL generation
   - Review CORS settings

### Getting Help

1. Check the [Supabase Documentation](https://supabase.com/docs)
2. Review server logs for detailed error messages
3. Verify your Supabase project settings
4. Check the Supabase dashboard for storage usage and errors

## 🔄 Migration from Cloudinary

If you're migrating from Cloudinary:

1. **Backup existing files** from Cloudinary
2. **Update environment variables** to use Supabase
3. **Create Supabase buckets** as described above
4. **Test file uploads** with the new system
5. **Gradually migrate existing files** if needed

The system now uses Supabase Storage instead of Cloudinary for all file operations, providing better integration with your existing Supabase setup and more cost-effective storage solutions.
