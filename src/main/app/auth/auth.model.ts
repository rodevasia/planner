
export const registerSchema: any = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    address: { type: 'string' },
    pincode: { type: 'string' },
    country: { type: 'string' },
    city: { type: 'string' },
    phone: { type: 'string' },
    email: { type: 'string', format: 'email' },
    password: { type: 'string' }
  },
  required: ['name', 'address', 'pincode', 'country', 'city', 'phone', 'email', 'password'],
  additionalProperties: false
}
