import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY')

console.log("Brevo Function Initialized")

serve(async (req) => {
    if (!BREVO_API_KEY) {
        console.error("Missing BREVO_API_KEY")
        return new Response(JSON.stringify({ error: 'Missing BREVO_API_KEY' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }

    try {
        const payload = await req.json()
        console.log("Received payload:", JSON.stringify(payload))

        // Handle Database Webhook Payload (INSERT on auth.users)
        const record = payload.record

        if (!record || !record.email) {
            return new Response(JSON.stringify({ message: 'No email found in payload' }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            })
        }

        const email = record.email
        const fullName = record.raw_user_meta_data?.full_name || ''

        // Split name if possible
        let firstName = ''
        let lastName = ''
        if (fullName) {
            const parts = fullName.split(' ')
            firstName = parts[0]
            if (parts.length > 1) lastName = parts.slice(1).join(' ')
        }

        console.log(`Adding contact to Brevo: ${email}`)

        // Call Brevo API to Create Contact
        const LIST_ID = parseInt(Deno.env.get('BREVO_LIST_ID') || '6')

        const res = await fetch('https://api.brevo.com/v3/contacts', {
            method: 'POST',
            headers: {
                'api-key': BREVO_API_KEY,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                attributes: {
                    FIRSTNAME: firstName,
                    LASTNAME: lastName
                },
                updateEnabled: true,
                listIds: [LIST_ID]
            })
        })

        const data = await res.json()
        console.log("Brevo Response:", data)

        if (!res.ok) {
            console.error("Brevo API Error:", data)
            return new Response(JSON.stringify({ error: 'Failed to add contact to Brevo', details: data }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            })
        }

        return new Response(JSON.stringify({ message: 'Contact added to Brevo successfully' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        })

    } catch (error) {
        console.error("Function Error:", error)
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        })
    }
})
