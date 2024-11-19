import Airtable from 'airtable';
import { Babysitter } from '@/types/babysitter';

const base = new Airtable({ apiKey: 'patXl1omFaUIAE61b.65020a5523d7b3110d0914ffcc4c6e3ba32e58dd1b6e2a213fb5f639edb5b79a' }).base(
  'appbQPN6CeEmayzz1'
);

export const findUserByMobile = async (mobile: string) => {
  try {
    const records = await base('Users')
      .select({
        filterByFormula: `{Mobile}='${mobile}'`,
        maxRecords: 1,
      })
      .firstPage();
    return records[0];
  } catch (error) {
    console.error('Error finding user:', error);
    return null;
  }
};

export const createUser = async (firstName: string, lastName: string, mobile: string) => {
  try {
    const records = await base('Users').create([
      {
        fields: {
          'First Name': firstName,
          'Last Name': lastName,
          Mobile: mobile,
        },
      },
    ]);
    return records[0];
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
};

export const createBabysitter = async (
  firstName: string,
  lastName: string | undefined,
  mobile: string,
  parentOwnerMobile: string
) => {
  try {
    const records = await base('Babysitters').create([
      {
        fields: {
          'First Name': firstName,
          'Last Name': lastName || '',
          'Mobile': mobile,
          'Parent Owner Mobile': parentOwnerMobile,
        },
      },
    ]);
    return records[0];
  } catch (error) {
    console.error('Error creating babysitter:', error);
    throw error;
  }
};

export const fetchBabysitters = async (parentOwnerMobile: string): Promise<Babysitter[]> => {
  try {
    const records = await base('Babysitters')
      .select({
        filterByFormula: `{Parent Owner Mobile}='${parentOwnerMobile}'`,
      })
      .all();

    return records.map((record) => ({
      id: record.id,
      firstName: record.get('First Name') as string,
      lastName: record.get('Last Name') as string,
      mobile: record.get('Mobile') as string,
      home: '',
      age: undefined,
      rate: undefined,
      specialties: '',
      notes: '',
    }));
  } catch (error) {
    console.error('Error fetching babysitters:', error);
    throw error;
  }
};

export const createRequest = async (
  date: Date,
  startTime: string,
  endTime: string,
  babysitterId: string,
  parentRequestorMobile: string
) => {
  try {
    const formattedDate = date.toISOString().split('T')[0];
    const timeRange = `${startTime} to ${endTime}`;
    
    const records = await base('Requests').create([
      {
        fields: {
          'Request Date': formattedDate,
          'Time Range': timeRange,
          'Babysitter': [babysitterId],
          'Parent Requestor Mobile': parentRequestorMobile,
          'Status': 'Created'
        },
      },
    ]);
    return records[0];
  } catch (error) {
    console.error('Error creating request:', error);
    throw error;
  }
};

export const fetchRequests = async (parentRequestorMobile: string) => {
  try {
    const records = await base('Requests')
      .select({
        filterByFormula: `{Parent Requestor Mobile}='${parentRequestorMobile}'`,
        sort: [{ field: 'Request Date', direction: 'desc' }],
      })
      .all();

    return records.map((record) => ({
      id: record.id,
      date: record.get('Request Date') as string,
      timeRange: record.get('Time Range') as string,
      babysitterId: (record.get('Babysitter') as string[])[0],
      status: record.get('Status') as string,
    }));
  } catch (error) {
    console.error('Error fetching requests:', error);
    throw error;
  }
};