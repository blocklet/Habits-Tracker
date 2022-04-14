const Database = require('@blocklet/sdk/lib/database');

/**
 * Data structure
 * - author: object
 *   - name: string
 *   - avatar: string
 *   - did: string
 * - participants: [{ did: String, name: String, records: [String] }]
 * - unitPrice: number
 * - title: string
 * - createdAt: string
 * - updatedAt: string
 * - startAt: string
 * - endAt: string
 */

class Projects extends Database {
  constructor() {
    super('projects');
  }
}

module.exports = new Projects();
