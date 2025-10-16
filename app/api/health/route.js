/**
 * Health Check API Endpoint
 * GET /api/health
 */

import { NextResponse } from 'next/server';
import { supabaseClient } from '@/lib/supabase';

// Use client for health checks (respects RLS)
const supabase = supabaseClient;

export async function GET() {
  try {
    const healthStatus = await performHealthCheck();
    const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
    
    return NextResponse.json(healthStatus, { status: statusCode });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
}

async function performHealthCheck() {
  const checks = await Promise.all([
    checkDatabaseHealth(),
    checkStorageHealth()
  ]);

  const [database, storage] = checks;
  const overall = database.status === 'healthy' && storage.status === 'healthy' 
    ? 'healthy' : 'unhealthy';

  return {
    status: overall,
    timestamp: new Date().toISOString(),
    checks: {
      database,
      storage
    }
  };
}

async function checkDatabaseHealth() {
  try {
    const startTime = Date.now();
    const { data, error } = await supabase
      .from('projects')
      .select('id')
      .limit(1);

    return {
      status: error ? 'unhealthy' : 'healthy',
      response_time: Date.now() - startTime,
      error: error?.message
    };
  } catch (err) {
    return {
      status: 'unhealthy',
      response_time: Date.now(),
      error: err.message
    };
  }
}

async function checkStorageHealth() {
  try {
    const startTime = Date.now();
    const { data, error } = await supabase.storage
      .from('project-media')
      .list('', { limit: 1 });

    return {
      status: error ? 'unhealthy' : 'healthy',
      response_time: Date.now() - startTime,
      error: error?.message
    };
  } catch (err) {
    return {
      status: 'unhealthy',
      response_time: Date.now(),
      error: err.message
    };
  }
}