import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request) {
  try {
    console.log('🔍 DEBUG: Testing hero section creation');
    
    const body = await request.json();
    console.log('🔍 DEBUG: Request body:', body);
    
    // Try to insert minimal data
    const testData = {
      title: body.title || 'Test Hero',
      background_type: 'image',
      background_value: 'https://example.com/test.jpg',
      is_active: true
    };
    
    console.log('🔍 DEBUG: Attempting to insert:', testData);
    
    const { data, error } = await supabaseAdmin
      .from('hero_sections')
      .insert([testData])
      .select()
      .single();
    
    if (error) {
      console.error('🔍 DEBUG: Database error:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        details: error
      });
    }
    
    console.log('🔍 DEBUG: Insert successful:', data);
    return NextResponse.json({ 
      success: true, 
      data,
      message: 'Hero section created successfully' 
    });
    
  } catch (error) {
    console.error('🔍 DEBUG: Catch error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      stack: error.stack 
    });
  }
}