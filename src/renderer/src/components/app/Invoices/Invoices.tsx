import { getInvoices } from '@renderer/api/invoices'
import BottomBar from '@renderer/components/ui/BottomBar'
import Loader from '@renderer/components/ui/Loader'
import { notify } from '@renderer/components/ui/notify'
import { project } from '@renderer/store'
import { A } from '@solidjs/router'
import axios from 'axios'
import dayjs from 'dayjs'
import { Button, Table } from 'solid-bootstrap'
import { createResource } from 'solid-js'

export default function Invoices() {
  const param = { projectId: project.id, clientId: project.clientId }
  const [invoices] = createResource(param, getInvoices)

  const downloadInvoice = async (name: string) => {
    try {
      const response = await axios.get(`http://localhost:6453/invoices/${name}.pdf`, {
        withCredentials: true
      })
      if (response.status === 200) {
        notify.success('Invoice Saved to ')
      } else {
        if (response.status === 400) {
          notify.error(JSON.parse(response.data).message)
        }
      }
    } catch (error) {
      notify.error('Error while fetching invoice')
    }
  }

  return (
    <>
      {invoices.loading && (
        <div style={{height:'70vh',}} class="m-auto d-flex vw-100">
          <Loader />
        </div>
      )}
      {invoices.state === 'ready' && (
        <div class=" col-md-11 m-auto">
          <div class="py-3 row border-bottom border-secondary">
            <p class="text-white display-6 col-md-6 py-md-0 my-md-0">Invoices</p>
            <div class="col-md-4 d-flex search-input mx-md-4 py-0">
              <div class="col-11">
                <input type="text" placeholder="Search Invoice" class="form-control  my-2" />
              </div>
              <div style={{ color: '#888888' }} class="bi bi-search col-1 my-auto"></div>
            </div>
            <A class='col d-flex' href={`/user/project/${project.id}/invoices/generate`}>
              <Button class="my-auto text-white" variant="primary">
                Generate
              </Button>
            </A>
          </div>
          <div class="mt-4">
            <Table
              responsive
              variant="dark"
              striped
              class="m-auto text-center py-2 overflow-visible"
            >
              <thead class="py-2">
                <tr class="text-center py-2">
                  <th>Invoice Number</th>
                  <th>Generated At</th>
                  <th>Download</th>
                </tr>
              </thead>
              <tbody class="text-center">
                {invoices().map((t, index) => {
                  return (
                    <tr>
                      <td>{t.name}</td>
                      <td>{dayjs(t.createdAt).format('DD MMM YYYY')}</td>
                      <td class="d-flex justify-content-center overflow-visible">
                        <i
                          onclick={() => downloadInvoice(t.name)}
                          class="btn btn-opacity bi bi-download text-primary"
                        ></i>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </Table>
          </div>
          <style>
            {`
            .search-input  input{
                border:none;
                box-shadow:none;
                outline:none;
                background:transparent;
                color:white !important;
            }
            .search-input  input:focus{
                 border:none;
                box-shadow:none;
                outline:none;
                background:transparent;

            }
            ::placeholder{
                color:#888888 !important;
            }
            .search-input{
                background:#606060;
                border-radius:8px;
            }
        `}
          </style>
          <BottomBar/>
        </div>
      )}
    </>
  )
}
