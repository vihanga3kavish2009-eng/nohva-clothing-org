// js/db.js - Supabase Configuration

// Pre-define DB object globally at the start to prevent "DB is not defined" error
window.DB = {
    supabaseClient: null,

    init: async function() {
        const URL = 'https://pzrfshsspbfgxszihnhk.supabase.co';
        const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6cmZzaHNzcGJmZ3hzemlobmhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMTYzOTgsImV4cCI6MjA4ODg5MjM5OH0.mOqeDWzd0uNbeE90iNdvONr5oxqo_Q7O4t2uIlV9hMk';

        try {
            if (!window.supabase) {
                console.error("Supabase SDK is missing from window!");
                throw new Error("Supabase library not loaded. Check script tags.");
            }
            if (!this.supabaseClient) {
                this.supabaseClient = window.supabase.createClient(URL, KEY);
            }
            console.log("Connected to: SUPABASE CLOUD DATABASE");
            return true;
        } catch (err) {
            console.error("Supabase initialization failed:", err);
            return false;
        }
    },

    addProduct: async function(product) {
        if (!this.supabaseClient) await this.init();
        try {
            let finalImageUrl = product.imageBase64;

            if (product.imageBase64.startsWith('data:')) {
                const fileName = `prod_${Date.now()}_${Math.floor(Math.random() * 1000)}.png`;
                const response = await fetch(product.imageBase64);
                const blob = await response.blob();

                const { data: uploadData, error: uploadError } = await this.supabaseClient.storage
                    .from('clothing-image')
                    .upload(fileName, blob, {
                        contentType: 'image/png',
                        cacheControl: '3600',
                        upsert: false
                    });

                if (uploadError) throw uploadError;

                const { data: publicUrlData } = this.supabaseClient.storage
                    .from('clothing-image')
                    .getPublicUrl(fileName);
                
                finalImageUrl = publicUrlData.publicUrl;
            } 

            const { data, error } = await this.supabaseClient
                .from('products')
                .insert([
                    {
                        name: product.name,
                        category: product.category,
                        type: product.type || '',
                        size: product.size,
                        price: product.price,
                        image_url: finalImageUrl,
                        timestamp: new Date().toISOString()
                    }
                ]);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Supabase Error (Add):', error.message);
            alert("Database Error: " + error.message);
            throw error;
        }
    },

    getAllProducts: async function() {
        if (!this.supabaseClient) await this.init();
        try {
            const { data, error } = await this.supabaseClient
                .from('products')
                .select('*')
                .order('timestamp', { ascending: false });

            if (error) throw error;

            return data.map(p => ({
                id: p.id,
                name: p.name,
                category: p.category,
                type: p.type || '',
                size: p.size,
                price: p.price,
                imageBase64: p.image_url,
                timestamp: p.timestamp
            }));
        } catch (error) {
            console.error('Supabase Error (Fetch):', error.message);
            return [];
        }
    },

    deleteProduct: async function(id) {
        if (!this.supabaseClient) await this.init();
        try {
            const { error } = await this.supabaseClient
                .from('products')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Supabase Error (Delete):', error.message);
            return false;
        }
    }
};
