import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'npm:@supabase/supabase-js'
import Airtable from 'npm:airtable'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Airtable.configure({
  apiKey: Deno.env.get('AIRTABLE_API_KEY'),
})

const base = Airtable.base('appbQPN6CeEmayzz1')
const BABYSITTERS_TABLE = 'tblOHkVqPWEus4ENk'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Verify the request has proper authorization
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const { action, data } = await req.json()
    console.log('Processing request:', { action, data })

    switch (action) {
      case 'fetch': {
        if (!data?.parentMobile) {
          throw new Error('Parent mobile number is required for fetch action')
        }

        console.log('Fetching babysitters for parent mobile:', data.parentMobile)
        
        const records = await base(BABYSITTERS_TABLE)
          .select({
            filterByFormula: `{Parent Owner Mobile}='${data.parentMobile}'`,
          })
          .all()

        console.log(`Found ${records.length} babysitters`)

        const babysitters = records.map(record => ({
          id: record.id,
          firstName: record.get('First Name'),
          lastName: record.get('Last Name'),
          mobile: record.get('Mobile'),
          email: record.get('Email'),
          age: record.get('Age'),
          grade: record.get('Grade'),
          rate: record.get('Rate'),
          specialties: record.get('Specialties'),
          notes: record.get('Notes'),
          babysitterId: record.get('Babysitter ID'),
        }))
        
        return new Response(
          JSON.stringify({ babysitters }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
      }

      case 'create': {
        if (!data?.firstName || !data?.mobile || !data?.parentMobile) {
          throw new Error('First name, mobile number, and parent mobile are required for create action')
        }

        console.log('Creating new babysitter:', data)

        const records = await base(BABYSITTERS_TABLE).create([
          {
            fields: {
              'First Name': data.firstName,
              'Last Name': data.lastName,
              'Mobile': data.mobile,
              'Parent Owner Mobile': data.parentMobile,
              'Age': data.age,
              'Grade': data.grade,
              'Rate': data.rate,
              'Specialties': data.specialties,
              'Notes': data.notes,
              'Email': data.email,
            },
          },
        ])

        console.log('Created babysitter:', records[0])
        
        return new Response(
          JSON.stringify({ record: records[0] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
      }

      case 'update': {
        if (!data?.id || !data?.firstName || !data?.mobile) {
          throw new Error('ID, first name, and mobile number are required for update action')
        }

        console.log('Updating babysitter:', data)

        const records = await base(BABYSITTERS_TABLE).update([
          {
            id: data.id,
            fields: {
              'First Name': data.firstName,
              'Last Name': data.lastName,
              'Mobile': data.mobile,
              'Age': data.age,
              'Grade': data.grade,
              'Rate': data.rate,
              'Specialties': data.specialties,
              'Notes': data.notes,
              'Email': data.email,
            },
          },
        ])

        console.log('Updated babysitter:', records[0])
        
        return new Response(
          JSON.stringify({ record: records[0] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
      }

      case 'delete': {
        if (!data?.id) {
          throw new Error('ID is required for delete action')
        }

        console.log('Deleting babysitter:', data)

        const records = await base(BABYSITTERS_TABLE).destroy([data.id])

        console.log('Deleted babysitter:', records[0])
        
        return new Response(
          JSON.stringify({ record: records[0] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
      }

      default:
        throw new Error(`Unsupported action: ${action}`)
    }
  } catch (error) {
    console.error('Error processing request:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})