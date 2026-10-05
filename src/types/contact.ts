/** Fields collected in the UI. The service maps these onto the Contact API body. */
export interface ContactPayload {
  firstName: string
  lastName: string
  email: string
  subject: string
  message: string
}
