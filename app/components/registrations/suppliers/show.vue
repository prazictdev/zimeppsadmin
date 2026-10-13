<template>
  <div>
    <button :class="['btn btn-primary', compact ? 'btn-xs btn-square' : 'btn-sm']" :title="compact ? 'View application' : undefined" @click="open">
      <Icon name="lucide:eye" :class="compact ? 'h-3.5 w-3.5' : ''" />
      <span v-if="!compact">View Details</span>
    </button>

    <!-- Document viewer modal -->
    <dialog :id="viewerModalId" class="modal">
      <div class="modal-box flex h-screen w-screen max-h-screen max-w-none flex-col rounded-none m-0 p-0">
        <div class="flex shrink-0 items-center justify-between border-b border-base-200 bg-base-100 px-6 py-3">
          <div>
            <p class="font-semibold text-sm">{{ viewerDoc?.file_name ?? 'Document' }}</p>
            <p class="text-xs text-base-content/50">{{ viewerDoc?.mime_type }}</p>
          </div>
          <button class="btn btn-ghost btn-sm btn-circle" @click="closeViewer">
            <Icon name="lucide:x" />
          </button>
        </div>
        <div class="flex flex-1 items-center justify-center overflow-hidden bg-base-200">
          <div v-if="viewerLoading" class="flex flex-col items-center gap-3 text-base-content/50">
            <span class="loading loading-spinner loading-lg" />
            <p class="text-sm">Loading document…</p>
          </div>
          <div v-else-if="viewerError" class="text-center text-sm text-error">
            <Icon name="lucide:alert-circle" class="mx-auto mb-2 h-6 w-6" />
            {{ viewerError }}
          </div>
          <template v-else-if="viewerDoc">
            <iframe
              v-if="viewerDoc.mime_type === 'application/pdf'"
              :src="viewerDoc.url"
              class="h-full w-full border-0"
              title="Document viewer"
            />
            <img
              v-else-if="viewerDoc.mime_type?.startsWith('image/')"
              :src="viewerDoc.url"
              :alt="viewerDoc.file_name"
              class="max-h-full max-w-full object-contain"
            />
            <div v-else class="text-center">
              <Icon name="lucide:file" class="mx-auto mb-3 h-10 w-10 text-base-content/30" />
              <p class="mb-3 text-sm text-base-content/60">Preview not available for this file type.</p>
              <a :href="viewerDoc.url" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm gap-1">
                <Icon name="lucide:download" class="h-4 w-4" />
                Download File
              </a>
            </div>
          </template>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="closeViewer">close</button>
      </form>
    </dialog>

    <dialog :id="modalId" class="modal">
      <div class="modal-box flex h-screen w-screen max-h-screen max-w-none flex-col rounded-none m-0 p-0">

        <!-- Header -->
        <div class="flex shrink-0 items-center justify-between border-b border-base-200 bg-base-100 px-6 py-4">
          <div>
            <h2 class="text-xl font-bold">{{ profile?.name ?? 'Company Profile' }}</h2>
            <p class="text-sm text-base-content/60">
              {{ profile?.reg_number ?? '' }}
              <span v-if="profile?.supplier_group"> · {{ profile.supplier_group }}</span>
            </p>
          </div>
          <button class="btn btn-ghost btn-sm btn-circle" :onclick="`document.getElementById('${modalId}').close()`">
            <Icon name="lucide:x" />
          </button>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="flex flex-1 items-center justify-center">
          <span class="loading loading-spinner loading-lg" />
        </div>

        <template v-else-if="profile">
          <!-- Tabs -->
          <div class="shrink-0 border-b border-base-200 bg-base-100 px-6">
            <div role="tablist" class="tabs tabs-bordered -mb-px">
              <button
                v-for="tab in tabs"
                :key="tab.key"
                role="tab"
                class="tab gap-1.5"
                :class="activeTab === tab.key ? 'tab-active font-semibold' : ''"
                @click="activeTab = tab.key"
              >
                <Icon :name="tab.icon" class="h-4 w-4" />
                {{ tab.label }}
                <span v-if="tab.count !== undefined" class="badge badge-sm">{{ tab.count }}</span>
              </button>
            </div>
          </div>

          <!-- Tab content -->
          <div class="flex-1 overflow-y-auto px-6 py-5">

            <!-- Overview -->
            <div v-if="activeTab === 'overview'" class="space-y-4">
              <!-- Company Details -->
              <div class="rounded-xl border border-base-200">
                <div class="border-b border-base-200 px-4 py-3">
                  <p class="text-left text-xs font-semibold uppercase tracking-wider text-base-content/50">Company Details</p>
                </div>
                <table class="table table-sm w-full">
                  <tbody>
                    <tr>
                      <td class="w-48 text-sm text-base-content/50">Company Name</td>
                      <td class="font-medium">{{ profile.name ?? '—' }}</td>
                    </tr>
                    <tr>
                      <td class="text-sm text-base-content/50">Registration Number</td>
                      <td><code class="rounded bg-base-200 px-1.5 py-0.5 text-xs font-mono">{{ profile.reg_number ?? '—' }}</code></td>
                    </tr>
                    <tr>
                      <td class="text-sm text-base-content/50">Supplier Group</td>
                      <td>
                        <span v-if="profile.supplier_group" class="badge badge-primary badge-sm">{{ profile.supplier_group }}</span>
                        <span v-else class="text-base-content/30">—</span>
                      </td>
                    </tr>
                    <tr>
                      <td class="text-sm text-base-content/50">Industry</td>
                      <td class="text-sm">{{ profile.industry ?? '—' }}</td>
                    </tr>
                    <tr>
                      <td class="text-sm text-base-content/50">Subcategory</td>
                      <td class="text-sm">{{ profile.subcategory ?? '—' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Contact Information -->
              <div class="rounded-xl border border-base-200">
                <div class="border-b border-base-200 px-4 py-3">
                  <p class="text-left text-xs font-semibold uppercase tracking-wider text-base-content/50">Contact Information</p>
                </div>
                <table class="table table-sm w-full">
                  <tbody>
                    <tr>
                      <td class="w-48 text-sm text-base-content/50">Email</td>
                      <td class="text-sm">{{ profile.email ?? '—' }}</td>
                    </tr>
                    <tr>
                      <td class="text-sm text-base-content/50">Phone</td>
                      <td class="text-sm">{{ profile.phone ?? '—' }}</td>
                    </tr>
                    <tr>
                      <td class="text-sm text-base-content/50">Website</td>
                      <td>
                        <a v-if="profile.website" :href="profile.website" target="_blank" rel="noopener noreferrer" class="link link-primary text-sm">{{ profile.website }}</a>
                        <span v-else class="text-sm text-base-content/30">—</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Location -->
              <div class="rounded-xl border border-base-200">
                <div class="border-b border-base-200 px-4 py-3">
                  <p class="text-left text-xs font-semibold uppercase tracking-wider text-base-content/50">Location</p>
                </div>
                <table class="table table-sm w-full">
                  <tbody>
                    <tr>
                      <td class="w-48 text-sm text-base-content/50">Address</td>
                      <td class="text-sm">{{ profile.address ?? '—' }}</td>
                    </tr>
                    <tr>
                      <td class="text-sm text-base-content/50">City</td>
                      <td class="text-sm">{{ profile.city ?? '—' }}</td>
                    </tr>
                    <tr>
                      <td class="text-sm text-base-content/50">District</td>
                      <td class="text-sm">{{ profile.district ?? '—' }}</td>
                    </tr>
                    <tr>
                      <td class="text-sm text-base-content/50">Province</td>
                      <td class="text-sm">{{ profile.province ?? '—' }}</td>
                    </tr>
                    <tr>
                      <td class="text-sm text-base-content/50">Country</td>
                      <td class="text-sm">{{ profile.country ?? '—' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Categories / Registrations -->
            <div v-if="activeTab === 'categories'">
              <div class="overflow-x-auto rounded-xl border border-base-200">
                <table class="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Year</th>
                      <th>Section</th>
                      <th>Category</th>
                      <th>Payment</th>
                      <th>Approval</th>
                      <th>Expiry</th>
                      <th>Locked</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="!profile.registrations.length">
                      <td colspan="7" class="py-6 text-center text-sm text-base-content/40">No registration records found.</td>
                    </tr>
                    <tr v-for="reg in profile.registrations" :key="reg.id">
                      <td class="font-semibold">{{ reg.year }}</td>
                      <td class="text-sm text-base-content/70">{{ reg.section ?? '—' }}</td>
                      <td class="font-medium">{{ reg.category ?? '—' }}</td>
                      <td>
                        <span class="badge badge-sm" :class="paymentStatusClass(reg.payment_status)">
                          {{ reg.payment_status ?? '—' }}
                        </span>
                      </td>
                      <td>
                        <span class="badge badge-sm" :class="approvalStatusClass(reg.approval_status)">
                          {{ reg.approval_status ?? '—' }}
                        </span>
                      </td>
                      <td class="text-sm">{{ formatDate(reg.expiry_date) }}</td>
                      <td>
                        <Icon v-if="reg.is_locked" name="lucide:lock" class="h-4 w-4 text-warning" />
                        <Icon v-else name="lucide:lock-open" class="h-4 w-4 text-base-content/30" />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Documents -->
            <div v-if="activeTab === 'documents'">
              <div class="overflow-x-auto rounded-xl border border-base-200">
                <table class="table table-sm w-full">
                  <thead>
                    <tr>
                      <th>Document</th>
                      <th>File Name</th>
                      <th>Size</th>
                      <th>Status</th>
                      <th>Rejection Reason</th>
                      <th class="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="!profile.documents.length">
                      <td colspan="6" class="py-8 text-center text-sm text-base-content/40">
                        <Icon name="lucide:file-x" class="mx-auto mb-2 h-6 w-6" />
                        No documents uploaded.
                      </td>
                    </tr>
                    <tr v-for="doc in profile.documents" :key="doc.id">
                      <td class="font-medium">{{ doc.name }}</td>
                      <td class="text-xs text-base-content/50">{{ doc.file_name ?? '—' }}</td>
                      <td class="text-sm">{{ formatFileSize(doc.file_size) }}</td>
                      <td>
                        <span class="badge badge-sm" :class="docStatusClass(doc.status)">{{ doc.status ?? '—' }}</span>
                      </td>
                      <td class="max-w-md text-xs">
                        <span v-if="isRejected(doc.status) && doc.rejection_reason" class="text-error">{{ doc.rejection_reason }}</span>
                        <span v-else class="text-base-content/30">—</span>
                      </td>
                      <td class="text-right">
                        <button
                          v-if="doc.has_file"
                          class="btn btn-ghost btn-xs gap-1"
                          @click="viewDocument(doc.id)"
                        >
                          <Icon name="lucide:eye" class="h-3.5 w-3.5" />
                          View
                        </button>
                        <span v-else class="text-xs text-base-content/30">No file</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Directors -->
            <div v-if="activeTab === 'directors'">
              <div class="overflow-x-auto rounded-xl border border-base-200">
                <table class="table table-sm w-full">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Gender</th>
                      <th>National ID</th>
                      <th>Status</th>
                      <th>Rejection Reason</th>
                      <th class="text-right">ID Document</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="!profile.directors.length">
                      <td colspan="6" class="py-8 text-center text-sm text-base-content/40">
                        <Icon name="lucide:users" class="mx-auto mb-2 h-6 w-6" />
                        No directors on record.
                      </td>
                    </tr>
                    <tr v-for="dir in profile.directors" :key="dir.id">
                      <td class="font-medium">{{ dir.name }}</td>
                      <td class="text-sm">{{ dir.gender ?? '—' }}</td>
                      <td class="text-sm"><code class="rounded bg-base-200 px-1.5 py-0.5 text-xs font-mono">{{ dir.national_id ?? '—' }}</code></td>
                      <td>
                        <span class="badge badge-sm" :class="docStatusClass(dir.status)">{{ dir.status ?? '—' }}</span>
                      </td>
                      <td class="max-w-md text-xs">
                        <span v-if="isRejected(dir.status) && dir.reject_reason" class="text-error">{{ dir.reject_reason }}</span>
                        <span v-else class="text-base-content/30">—</span>
                      </td>
                      <td class="text-right">
                        <button
                          v-if="dir.has_file"
                          class="btn btn-ghost btn-xs gap-1"
                          @click="viewDirectorDocument(dir.id)"
                        >
                          <Icon name="lucide:eye" class="h-3.5 w-3.5" />
                          View
                        </button>
                        <span v-else class="text-xs text-base-content/30">No file</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Shareholders -->
            <div v-if="activeTab === 'shareholders'">
              <div v-if="!profile.shareholders.length" class="py-8 text-center text-sm text-base-content/40">
                <Icon name="lucide:users" class="mx-auto mb-2 h-8 w-8" />
                No shareholders on record.
              </div>
              <div v-else class="overflow-x-auto rounded-xl border border-base-200">
                <table class="table w-full">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Nationality</th>
                      <th>ID Type</th>
                      <th>ID Number</th>
                      <th class="text-right">Share %</th>
                      <th>Status</th>
                      <th>Rejection Reason</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="sh in profile.shareholders" :key="sh.id">
                      <td class="font-medium">{{ sh.name }}</td>
                      <td class="text-sm">{{ sh.nationality ?? '—' }}</td>
                      <td class="text-sm">{{ sh.identification_type ?? '—' }}</td>
                      <td class="text-sm"><code class="rounded bg-base-200 px-1.5 py-0.5 text-xs">{{ sh.identification_number ?? '—' }}</code></td>
                      <td class="text-right font-mono font-semibold">
                        <span
                          class="badge badge-sm"
                          :class="sh.share_percentage >= 50 ? 'badge-primary' : 'badge-ghost'"
                        >{{ sh.share_percentage }}%</span>
                      </td>
                      <td>
                        <span class="badge badge-sm" :class="docStatusClass(sh.status)">{{ sh.status ?? '—' }}</span>
                      </td>
                      <td class="max-w-md text-xs">
                        <span v-if="isRejected(sh.status) && sh.reject_reason" class="text-error">{{ sh.reject_reason }}</span>
                        <span v-else class="text-base-content/30">—</span>
                      </td>
                      <td class="text-right">
                        <button
                          v-if="sh.has_file"
                          class="btn btn-ghost btn-xs gap-1"
                          @click="viewShareholderDocument(sh.id)"
                        >
                          <Icon name="lucide:eye" class="h-3.5 w-3.5" />
                          View
                        </button>
                        <span v-else class="text-xs text-base-content/30">—</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Portfolio -->
            <div v-if="activeTab === 'portfolio'">
              <div v-if="!profile.portfolio" class="py-8 text-left text-sm text-base-content/40">
                <Icon name="lucide:briefcase" class="mb-2 h-6 w-6" />
                No portfolio information available.
              </div>
              <div v-else class="space-y-4">

                <!-- Business Information -->
                <div class="rounded-xl border border-base-200">
                  <div class="border-b border-base-200 px-4 py-3">
                    <p class="text-left text-xs font-semibold uppercase tracking-wider text-base-content/50">Business Information</p>
                  </div>
                  <table class="table table-sm w-full">
                    <tbody>
                      <tr>
                        <td class="w-48 text-sm text-base-content/50">Date Established</td>
                        <td class="text-sm">{{ formatDate(profile.portfolio.date_established) }}</td>
                      </tr>
                      <tr>
                        <td class="text-sm text-base-content/50">Branches</td>
                        <td class="text-sm">{{ profile.portfolio.branches ?? '—' }}</td>
                      </tr>
                      <tr>
                        <td class="text-sm text-base-content/50">Business Description</td>
                        <td class="text-sm leading-relaxed">{{ profile.portfolio.business_description ?? '—' }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- Products & Services -->
                <div class="rounded-xl border border-base-200">
                  <div class="border-b border-base-200 px-4 py-3">
                    <p class="text-left text-xs font-semibold uppercase tracking-wider text-base-content/50">Products &amp; Services</p>
                  </div>
                  <div v-if="!profile.portfolio.products.length" class="px-4 py-6 text-left text-sm text-base-content/40">
                    No products or services listed.
                  </div>
                  <table v-else class="table table-sm w-full">
                    <thead>
                      <tr>
                        <th class="text-left">Product / Service</th>
                        <th class="text-left">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(product, pi) in profile.portfolio.products" :key="pi">
                        <td class="font-medium align-top">{{ product.name }}</td>
                        <td class="text-sm text-base-content/70 align-top">{{ product.description ?? '—' }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- Previous Orders / Contracts -->
                <div class="rounded-xl border border-base-200">
                  <div class="border-b border-base-200 px-4 py-3">
                    <p class="text-left text-xs font-semibold uppercase tracking-wider text-base-content/50">Previous Orders / Contracts</p>
                  </div>
                  <div v-if="!profile.portfolio.orders.length" class="px-4 py-6 text-left text-sm text-base-content/40">
                    No previous orders or contracts on record.
                  </div>
                  <table v-else class="table table-sm w-full">
                    <thead>
                      <tr>
                        <th class="text-left">Description</th>
                        <th class="text-left">Year</th>
                        <th class="text-left">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(order, oi) in profile.portfolio.orders" :key="oi">
                        <td class="text-sm">{{ order.description }}</td>
                        <td class="text-sm">{{ order.year }}</td>
                        <td class="font-mono text-sm">{{ order.currency }} {{ Number(order.value).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

              </div>
            </div>

            <!-- AI Review -->
            <div v-if="activeTab === 'ai_review'" class="space-y-4">
              <div v-if="logsLoading" class="flex justify-center py-12">
                <span class="loading loading-spinner loading-lg" />
              </div>
              <template v-else-if="!latestReview && !registrationLogs.length && !reviewRuns.length">
                <div class="flex flex-col items-center py-12 text-center text-base-content/40">
                  <Icon name="lucide:bot" class="mb-3 h-10 w-10" />
                  <p class="text-sm">No AI review findings yet. The AI agent has not reviewed this application.</p>
                </div>
              </template>
              <template v-else>

                <!-- AI execution history -->
                <div v-if="reviewRuns.length" class="rounded-xl border border-base-200 text-left">
                  <div class="border-b border-base-200 px-4 py-3 flex items-center justify-between">
                    <p class="text-xs font-semibold uppercase tracking-wider text-base-content/50">AI Review Attempts</p>
                    <span class="badge badge-sm badge-ghost">{{ reviewRuns.length }}</span>
                  </div>
                  <div class="divide-y divide-base-200">
                    <details v-for="run in reviewRuns" :key="run.uuid" class="group">
                      <summary class="flex cursor-pointer list-none items-center gap-3 px-4 py-3">
                        <span
                          class="badge badge-sm"
                          :class="run.status === 'COMPLETED' ? 'badge-success' : run.status === 'FAILED' ? 'badge-error' : 'badge-warning'"
                        >
                          {{ run.status }}
                        </span>
                        <div class="min-w-0 flex-1">
                          <p class="text-sm font-medium">{{ run.trigger === 'PAYMENT_JOB' ? 'Automatic payment review' : 'Manual command review' }}</p>
                          <p class="truncate text-xs text-base-content/45">
                            {{ formatDate(run.started_at) }} · {{ run.provider }} / {{ run.model }}
                          </p>
                        </div>
                        <div class="hidden text-right text-xs text-base-content/50 sm:block">
                          <p>{{ run.tool_calls_count }} tool calls</p>
                          <p>{{ run.emails_queued }} emails queued</p>
                        </div>
                        <Icon name="lucide:chevron-down" class="h-4 w-4 transition-transform group-open:rotate-180" />
                      </summary>
                      <div class="space-y-3 border-t border-base-200 bg-base-200/20 px-4 py-3">
                        <div class="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                          <div><span class="text-base-content/45">Run ID</span><p class="mt-0.5 break-all font-mono">{{ run.uuid }}</p></div>
                          <div><span class="text-base-content/45">Duration</span><p class="mt-0.5">{{ run.duration_seconds === null ? 'Still running' : `${run.duration_seconds}s` }}</p></div>
                          <div><span class="text-base-content/45">Tool calls</span><p class="mt-0.5">{{ run.tool_calls_count }}</p></div>
                          <div><span class="text-base-content/45">Emails queued</span><p class="mt-0.5">{{ run.emails_queued }}</p></div>
                        </div>
                        <div v-if="run.error" class="rounded-lg bg-error/10 p-3 text-sm text-error">
                          <p class="mb-1 text-xs font-semibold uppercase">Failure response</p>
                          <p class="whitespace-pre-wrap">{{ run.error }}</p>
                        </div>
                        <div v-if="run.response" class="rounded-lg bg-base-100 p-3 text-sm text-base-content/75">
                          <p class="mb-1 text-xs font-semibold uppercase text-base-content/45">Agent response</p>
                          <p class="whitespace-pre-wrap">{{ run.response }}</p>
                        </div>
                      </div>
                    </details>
                  </div>
                </div>

                <!-- Review Summary -->
                <div v-if="latestReview" class="rounded-xl border border-base-200 text-left">
                  <div class="border-b border-base-200 px-4 py-3 flex items-center justify-between">
                    <p class="text-xs font-semibold uppercase tracking-wider text-base-content/50">Review Summary</p>
                    <div class="flex items-center gap-2">
                      <span class="text-xs text-base-content/40">{{ formatDate(latestReview.created_at) }}</span>
                      <span class="badge badge-sm" :class="latestReview.result === 'APPROVED' ? 'badge-success' : latestReview.result === 'FLAGGED' ? 'badge-error' : 'badge-warning'">
                        {{ latestReview.result }}
                      </span>
                    </div>
                  </div>
                  <div class="grid grid-cols-2 divide-x divide-base-200 border-b border-base-200">
                    <div class="px-4 py-3 text-left">
                      <p class="text-2xl font-bold tabular-nums">{{ latestReview.documents_checked }}</p>
                      <p class="text-xs text-base-content/50 mt-0.5">Documents Checked</p>
                    </div>
                    <div class="px-4 py-3 text-left">
                      <p class="text-2xl font-bold tabular-nums" :class="latestReview.issues_found > 0 ? 'text-error' : 'text-success'">
                        {{ latestReview.issues_found }}
                      </p>
                      <p class="text-xs text-base-content/50 mt-0.5">Issues Found</p>
                    </div>
                  </div>
                  <div class="p-4 text-left">
                    <p class="text-xs font-semibold uppercase tracking-wider text-base-content/50 mb-2">Decision Reason</p>
                    <p class="text-sm leading-relaxed text-base-content/80">{{ latestReview.decision_reason ?? '—' }}</p>
                  </div>
                  <div v-if="latestReview.findings?.length" class="border-t border-base-200 p-4 text-left">
                    <p class="text-xs font-semibold uppercase tracking-wider text-base-content/50 mb-2">Findings ({{ latestReview.findings.length }})</p>
                    <ul class="space-y-1">
                      <li
                        v-for="(finding, fi) in latestReview.findings"
                        :key="fi"
                        class="flex items-start gap-2 text-sm text-base-content/70 text-left"
                      >
                        <Icon name="lucide:circle-dot" class="mt-0.5 h-3.5 w-3.5 shrink-0 text-base-content/30" />
                        <span>{{ finding }}</span>
                      </li>
                    </ul>
                  </div>
                  <details v-if="latestReview.comparison_results" class="border-t border-base-200 text-left">
                    <summary class="flex cursor-pointer items-center justify-between gap-3 px-4 py-3 text-sm font-semibold">
                      <span>Companies and Deeds comparison</span>
                      <span
                        class="badge badge-sm"
                        :class="latestReview.comparison_results.overall_match ? 'badge-success' : 'badge-error'"
                      >
                        {{ latestReview.comparison_results.overall_match ? 'All details match' : 'Differences found' }}
                      </span>
                    </summary>
                    <div class="space-y-5 border-t border-base-200 p-4">
                      <section>
                        <h4 class="mb-2 text-xs font-semibold uppercase tracking-wider text-base-content/50">Company details</h4>
                        <div class="overflow-x-auto rounded-lg border border-base-200">
                          <table class="table table-sm">
                            <thead>
                              <tr><th>Field</th><th>Captured</th><th>Deeds</th><th>Status</th></tr>
                            </thead>
                            <tbody>
                              <tr v-for="(field, key) in latestReview.comparison_results.company?.fields" :key="key">
                                <td class="font-medium">{{ field.label }}</td>
                                <td>{{ field.captured || '—' }}</td>
                                <td>{{ field.deeds || '—' }}</td>
                                <td>
                                  <span class="badge badge-sm" :class="comparisonStatusClass(field.status)">
                                    {{ field.status?.replace(/_/g, ' ') }}
                                  </span>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </section>

                      <section
                        v-for="section in ['directors', 'shareholders']"
                        :key="section"
                      >
                        <div class="mb-2 flex items-center justify-between gap-2">
                          <h4 class="text-xs font-semibold uppercase tracking-wider text-base-content/50">{{ section }}</h4>
                          <span class="text-xs text-base-content/50">
                            Captured {{ latestReview.comparison_results[section]?.captured_count ?? 0 }} ·
                            Deeds {{ latestReview.comparison_results[section]?.deeds_count ?? 0 }}
                          </span>
                        </div>
                        <div class="overflow-x-auto rounded-lg border border-base-200">
                          <table class="table table-sm">
                            <thead>
                              <tr><th>Person</th><th>ID number</th><th v-if="section === 'shareholders'">Ownership</th><th>Status</th></tr>
                            </thead>
                            <tbody>
                              <tr
                                v-for="(record, ri) in latestReview.comparison_results[section]?.records ?? []"
                                :key="`${section}-${ri}`"
                              >
                                <td>
                                  <p class="font-medium">{{ comparisonPerson(record)?.full_name || '—' }}</p>
                                  <p v-if="record.mismatched_fields?.length" class="text-xs text-error">
                                    Differs: {{ record.mismatched_fields.join(', ').replace(/_/g, ' ') }}
                                  </p>
                                </td>
                                <td>{{ comparisonPerson(record)?.identification_number || '—' }}</td>
                                <td v-if="section === 'shareholders'">
                                  {{ comparisonPerson(record)?.share_percentage ?? '—' }}<span v-if="comparisonPerson(record)?.share_percentage !== null">%</span>
                                </td>
                                <td><span class="badge badge-sm" :class="comparisonStatusClass(record.status)">{{ record.status?.replace(/_/g, ' ') }}</span></td>
                              </tr>
                              <tr v-if="!latestReview.comparison_results[section]?.records?.length">
                                <td :colspan="section === 'shareholders' ? 4 : 3" class="text-center text-base-content/45">No records returned.</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </section>
                    </div>
                  </details>
                  <div v-if="latestReview.certificate_number" class="border-t border-base-200 px-4 py-3 flex items-center gap-2 text-left">
                    <Icon name="lucide:award" class="h-4 w-4 text-success" />
                    <span class="text-xs text-base-content/50">Certificate:</span>
                    <code class="text-xs font-mono font-semibold">{{ latestReview.certificate_number }}</code>
                  </div>
                </div>

                <!-- Profile Summary -->
                <div v-if="profileAnalysis" class="rounded-xl border border-base-200 text-left">
                  <div class="border-b border-base-200 px-4 py-3 flex items-center justify-between">
                    <p class="text-xs font-semibold uppercase tracking-wider text-base-content/50">Company Profile Assessment</p>
                    <span class="badge badge-sm" :class="readinessLabelClass(profileAnalysis.readiness_label)">
                      {{ profileAnalysis.readiness_label?.replace(/_/g, ' ') ?? '' }}
                    </span>
                  </div>
                  <div class="p-4 space-y-3 text-left">
                    <p class="text-sm leading-relaxed text-base-content/80">{{ profileAnalysis.profile_summary }}</p>
                    <div v-if="profileAnalysis.readiness_score !== undefined" class="flex items-center gap-3">
                      <span class="text-xs text-base-content/50">Readiness Score</span>
                      <progress
                        class="progress w-40"
                        :class="profileAnalysis.readiness_score >= 70 ? 'progress-success' : profileAnalysis.readiness_score >= 50 ? 'progress-warning' : 'progress-error'"
                        :value="profileAnalysis.readiness_score"
                        max="100"
                      />
                      <span class="text-sm font-semibold tabular-nums">{{ profileAnalysis.readiness_score }}/100</span>
                    </div>
                  </div>
                </div>

                <!-- Action Items -->
                <div v-if="actionItems.length" class="rounded-xl border border-error/30 bg-error/5 text-left">
                  <div class="border-b border-error/20 px-4 py-3">
                    <p class="text-xs font-semibold uppercase tracking-wider text-error">Action Required ({{ actionItems.length }})</p>
                  </div>
                  <div class="divide-y divide-base-200">
                    <div v-for="item in actionItems" :key="item.id" class="px-4 py-3 text-left">
                      <div class="flex items-start gap-2 mb-1">
                        <span class="badge badge-sm shrink-0 mt-0.5" :class="severityBadgeClass(item.severity)">{{ item.severity }}</span>
                        <p class="text-sm font-semibold">{{ item.title }}</p>
                      </div>
                      <p v-if="item.details" class="text-sm text-base-content/70 leading-relaxed">{{ item.details }}</p>
                      <p v-if="item.action_required" class="mt-1.5 text-xs text-base-content/60 italic">
                        <Icon name="lucide:arrow-right" class="inline h-3 w-3 mr-0.5" />
                        {{ item.action_required }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Check results -->
                <div v-if="otherLogs.length" class="rounded-xl border border-base-200 text-left">
                  <div class="border-b border-base-200 px-4 py-3">
                    <p class="text-xs font-semibold uppercase tracking-wider text-base-content/50">Check Results ({{ otherLogs.length }})</p>
                  </div>
                  <div class="overflow-x-auto">
                    <table class="table table-sm w-full text-left">
                      <thead>
                        <tr>
                          <th class="text-left">Check</th>
                          <th class="text-left">Area</th>
                          <th class="text-left">Severity</th>
                          <th class="text-left">Status</th>
                          <th class="text-left">Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="log in otherLogs" :key="log.id">
                          <td class="font-medium text-sm max-w-48 text-left">{{ log.title }}</td>
                          <td class="text-xs text-base-content/50 text-left">{{ log.area ?? log.type?.replace(/_/g, ' ') ?? '—' }}</td>
                          <td class="text-left">
                            <span class="badge badge-sm" :class="severityBadgeClass(log.severity)">{{ log.severity }}</span>
                          </td>
                          <td class="text-left">
                            <span class="badge badge-sm" :class="statusBadgeClass(log.status)">{{ log.status }}</span>
                          </td>
                          <td class="text-xs text-base-content/60 max-w-xs truncate text-left">{{ log.details && log.type !== 'PROFILE_ANALYSIS' ? log.details : '—' }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

              </template>
            </div>

            <!-- Comments -->
            <div v-if="activeTab === 'comments'" class="space-y-4">
              <!-- Add comment form -->
              <div class="rounded-xl border border-base-200">
                <div class="border-b border-base-200 px-4 py-3">
                  <p class="text-left text-xs font-semibold uppercase tracking-wider text-base-content/50">Add Comment</p>
                </div>
                <div class="p-4 space-y-3">
                  <div>
                    <label class="fieldset">
                      <span class="fieldset-legend">Area of Concern</span>
                      <select v-model="newComment.area" class="select select-sm select-bordered w-80">
                        <option value="">— Select area —</option>
                        <option value="Documents">Documents</option>
                        <option value="Directors">Directors</option>
                        <option value="Shareholders">Shareholders</option>
                        <option value="Portfolio">Portfolio</option>
                        <option value="Contact Information">Contact Information</option>
                        <option value="Registration Details">Registration Details</option>
                        <option value="Payment">Payment</option>
                        <option value="Other">Other</option>
                      </select>
                      <label v-if="errors.area" class="label">
                        <span class="label-text-alt text-red-600">{{ errors.area }}</span>
                      </label>
                    </label>
                  </div>
                  <div>
                    <label class="fieldset">
                      <span class="fieldset-legend">Comment</span>
                    <textarea
                      v-model="newComment.comment"
                      rows="3"
                      placeholder="Describe the area that needs attention…"
                      class="textarea textarea-bordered w-full text-sm"
                    />
                    <label v-if="errors.comment" class="label">
                      <span class="label-text-alt text-red-600">{{ errors.comment }}</span>
                    </label>
                    </label>
                  </div>
                  <label class="flex cursor-pointer items-start gap-3 rounded-lg border border-warning/35 bg-warning/10 p-3">
                    <input v-model="newComment.notify_supplier" type="checkbox" class="checkbox checkbox-warning checkbox-sm mt-0.5" />
                    <span>
                      <span class="block text-sm font-semibold">Notify supplier — action required</span>
                      <span class="block text-xs text-base-content/60">Shows this comment as an outstanding action on the supplier dashboard and sends a notification.</span>
                    </span>
                  </label>
                  <div class="flex justify-end">
                    <button
                      class="btn btn-primary btn-sm gap-1"
                      :disabled="!newComment.comment.trim() || commentSaving"
                      @click="submitComment"
                    >
                      <span v-if="commentSaving" class="loading loading-spinner loading-xs" />
                      <Icon v-else name="lucide:send" class="h-3.5 w-3.5" />
                      Save Comment
                    </button>
                  </div>
                </div>
              </div>

              <!-- Comment list -->
              <div class="rounded-xl border border-base-200">
                <div class="border-b border-base-200 px-4 py-3">
                  <p class="text-left text-xs font-semibold uppercase tracking-wider text-base-content/50">Comments ({{ comments.length }})</p>
                </div>
                <div v-if="commentsLoading" class="flex justify-center py-8">
                  <span class="loading loading-spinner loading-md" />
                </div>
                <div v-else-if="!comments.length" class="px-4 py-8 text-left text-sm text-base-content/40">
                  No comments yet.
                </div>
                <div v-else class="divide-y divide-base-200">
                  <div v-for="c in comments" :key="c.id" class="px-4 py-3 text-left">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="text-xs font-semibold text-left">{{ c.author }}</span>
                      <span v-if="c.is_ai" class="badge badge-xs badge-info">AI</span>
                      <span v-if="c.area" class="badge badge-xs badge-ghost">{{ c.area }}</span>
                      <span v-if="c.requires_supplier_action && !c.actioned_at" class="badge badge-xs badge-warning">Supplier action required</span>
                      <span v-if="c.actioned_at" class="badge badge-xs badge-success">Actioned</span>
                      <span class="ml-auto text-xs text-base-content/40">{{ formatDate(c.created_at) }}</span>
                    </div>
                    <p class="text-left text-sm text-base-content/80 leading-relaxed">{{ c.comment }}</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </template>

        <div class="shrink-0 border-t border-base-200 bg-base-100 px-6 py-3 flex items-center justify-end gap-2">
          <button v-if="canProcess" class="btn btn-success btn-sm gap-1" @click="openApproveConfirm">
            <Icon name="lucide:check-circle" class="h-4 w-4" />
            Approve
          </button>
          <button class="btn btn-sm" :onclick="`document.getElementById('${modalId}').close()`">Close</button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>

    <!-- Approve confirmation modal -->
    <dialog :id="approveModalId" class="modal">
      <div class="modal-box max-w-md">
        <div class="flex items-start gap-4">
          <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-warning/15 text-warning">
            <Icon name="lucide:alert-triangle" class="h-5 w-5" />
          </div>
          <div class="text-left">
            <h3 class="text-base font-bold">Confirm Approval</h3>
            <p class="mt-2 text-sm text-base-content/70 leading-relaxed">
              Please confirm that you have completed all required checks and that
              <strong>{{ profile?.name }}</strong> meets all the criteria to be added to the approved suppliers list.
            </p>
            <ul class="mt-3 space-y-1 text-sm text-base-content/60">
              <li class="flex items-center gap-2"><Icon name="lucide:check" class="h-3.5 w-3.5 text-success shrink-0" /> All documents have been verified</li>
              <li class="flex items-center gap-2"><Icon name="lucide:check" class="h-3.5 w-3.5 text-success shrink-0" /> Directors and shareholders have been confirmed</li>
              <li class="flex items-center gap-2"><Icon name="lucide:check" class="h-3.5 w-3.5 text-success shrink-0" /> Payment has been processed and confirmed</li>
              <li class="flex items-center gap-2"><Icon name="lucide:check" class="h-3.5 w-3.5 text-success shrink-0" /> Company meets all registration requirements</li>
            </ul>
          </div>
        </div>
        <div class="modal-action mt-5">
          <button class="btn btn-sm" :disabled="approving" @click="closeApproveConfirm">Cancel</button>
          <button class="btn btn-success btn-sm gap-1" :disabled="approving" @click="confirmApprove">
            <span v-if="approving" class="loading loading-spinner loading-xs" />
            <Icon v-else name="lucide:check-circle" class="h-4 w-4" />
            Yes, Approve
          </button>
        </div>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  </div>
</template>

<script setup>
const props = defineProps({
  item: { type: Object, required: true },
  autoOpen: { type: Boolean, default: false },
  compact: { type: Boolean, default: false },
})
const errors = reactive({
  area: '',
  comment: '',
})
const submitting = ref(false)
const { can } = useCheckPermission()
const canProcess = computed(() => can('can.process.supplierregistrations'))

const store = useRegistrationStore()
const profile = ref(null)
const loading = ref(false)
const activeTab = ref('overview')

const modalId = computed(() => `reg_supplier_modal_${props.item.id}`)
const viewerModalId = computed(() => `reg_doc_viewer_${props.item.id}`)
const approveModalId = computed(() => `reg_approve_modal_${props.item.id}`)

const approving = ref(false)

const openApproveConfirm = () => document.getElementById(approveModalId.value).showModal()
const closeApproveConfirm = () => document.getElementById(approveModalId.value).close()

const confirmApprove = async () => {
  approving.value = true
  const { ok, error } = await store.approveRegistration(props.item.company_id)
  approving.value = false
  if (ok) {
    closeApproveConfirm()
    document.getElementById(modalId.value).close()
    await store.fetchAll({ year: new Date().getFullYear() })
  } else {
    alert(error)
  }
}

const viewerDoc = ref(null)
const viewerLoading = ref(false)
const viewerError = ref(null)

const comments = ref([])
const commentsLoading = ref(false)
const commentSaving = ref(false)
const newComment = reactive({ comment: '', area: '', notify_supplier: false })

const registrationLogs = ref([])
const registrationReviews = ref([])
const reviewRuns = ref([])
const logsLoading = ref(false)

const latestReview = computed(() => registrationReviews.value[0] ?? null)

const comparisonStatusClass = (status) => {
  if (status === 'MATCH') return 'badge-success'
  if (status === 'NOT_AVAILABLE') return 'badge-ghost'
  return 'badge-error'
}

const comparisonPerson = (record) => record?.captured ?? record?.deeds ?? null

const profileAnalysis = computed(() => {
  const log = registrationLogs.value.find(l => l.type === 'PROFILE_ANALYSIS')
  if (!log) return null
  const decoded = (() => { try { return JSON.parse(log.details ?? '') } catch { return null } })()
  return decoded ?? { profile_summary: log.title, readiness_score: undefined, readiness_label: undefined }
})

const actionItems = computed(() =>
  registrationLogs.value.filter(l => l.type === 'ACTION_ITEM')
)

const otherLogs = computed(() =>
  registrationLogs.value.filter(l => l.type !== 'ACTION_ITEM' && l.type !== 'OVERALL_ASSESSMENT')
)

const loadLogs = async () => {
  logsLoading.value = true
  const [logsResult, reviewsResult, runsResult] = await Promise.all([
    store.getRegistrationLogs(props.item.company_id),
    store.getRegistrationReviews(props.item.company_id),
    store.getRegistrationReviewRuns(props.item.company_id),
  ])
  if (logsResult.ok) registrationLogs.value = logsResult.data
  if (reviewsResult.ok) registrationReviews.value = reviewsResult.data
  if (runsResult.ok) reviewRuns.value = runsResult.data
  logsLoading.value = false
}

const viewDocument = async (documentId) => {
  viewerDoc.value = null
  viewerError.value = null
  viewerLoading.value = true
  document.getElementById(viewerModalId.value).showModal()
  const { ok, data, error } = await store.fetchDocumentUrl(documentId)
  if (ok) {
    viewerDoc.value = data
  } else {
    viewerError.value = error
  }
  viewerLoading.value = false
}

const closeViewer = () => {
  document.getElementById(viewerModalId.value).close()
  viewerDoc.value = null
  viewerError.value = null
}

const viewDirectorDocument = async (directorId) => {
  viewerDoc.value = null
  viewerError.value = null
  viewerLoading.value = true
  document.getElementById(viewerModalId.value).showModal()
  const { ok, data, error } = await store.fetchDirectorDocumentUrl(directorId)
  if (ok) {
    viewerDoc.value = data
  } else {
    viewerError.value = error
  }
  viewerLoading.value = false
}

const viewShareholderDocument = async (shareholderId) => {
  viewerDoc.value = null
  viewerError.value = null
  viewerLoading.value = true
  document.getElementById(viewerModalId.value).showModal()
  const { ok, data, error } = await store.fetchShareholderDocumentUrl(shareholderId)
  if (ok) {
    viewerDoc.value = data
  } else {
    viewerError.value = error
  }
  viewerLoading.value = false
}

const tabs = computed(() => [
  { key: 'overview', label: 'Overview', icon: 'lucide:building-2' },
  { key: 'categories', label: 'Categories', icon: 'lucide:tag', count: profile.value?.registrations?.length },
  { key: 'documents', label: 'Documents', icon: 'lucide:file-text', count: profile.value?.documents?.length },
  { key: 'directors', label: 'Directors', icon: 'lucide:user-check', count: profile.value?.directors?.length },
  { key: 'shareholders', label: 'Shareholders', icon: 'lucide:users', count: profile.value?.shareholders?.length },
  { key: 'portfolio', label: 'Portfolio', icon: 'lucide:briefcase' },
  { key: 'ai_review', label: 'AI Review', icon: 'lucide:bot', count: actionItems.value.length || undefined },
  { key: 'comments', label: 'Comments', icon: 'lucide:message-square', count: comments.value.length || undefined },
])

const loadComments = async () => {
  commentsLoading.value = true
  const { ok, data } = await store.getComments(props.item.company_id)
  if (ok) comments.value = data
  commentsLoading.value = false
}

const submitComment = async () => {
  if (!newComment.comment.trim()) return
  commentSaving.value = true
  const { ok, data } = await store.postComment(props.item.company_id, {
    comment: newComment.comment.trim(),
    area: newComment.area.trim() || null,
    notify_supplier: newComment.notify_supplier,
  })
  if (ok && data) {
    comments.value.unshift(data)
    newComment.comment = ''
    newComment.area = ''
    newComment.notify_supplier = false
  }
  commentSaving.value = false
}

watch(activeTab, (tab) => {
  if (tab === 'comments' && profile.value) loadComments()
  if (tab === 'ai_review' && profile.value) loadLogs()
})

const open = async () => {
  document.getElementById(modalId.value).showModal()
  if (profile.value) return
  loading.value = true
  profile.value = await store.fetchOne(props.item.company_id)
  loading.value = false
}

onMounted(() => {
  if (props.autoOpen) nextTick(open)
})

const formatDate = (value) => {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

const formatFileSize = (bytes) => {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const paymentStatusClass = (s) => ({
  'badge-success': ['PAID', 'SETTLED'].includes(s?.toUpperCase()),
  'badge-warning': s?.toUpperCase() === 'PENDING',
  'badge-error': s?.toUpperCase() === 'FAILED',
  'badge-ghost': !s,
})

const approvalStatusClass = (s) => ({
  'badge-success': s?.toUpperCase() === 'APPROVED',
  'badge-warning': s?.toUpperCase() === 'PENDING',
  'badge-error': s?.toUpperCase() === 'REJECTED',
  'badge-info': s?.toUpperCase() === 'UNDER_REVIEW',
  'badge-ghost': !s,
})

const docStatusClass = (s) => ({
  'badge-success': s?.toUpperCase() === 'APPROVED',
  'badge-warning': s?.toUpperCase() === 'PENDING',
  'badge-error': s?.toUpperCase() === 'REJECTED',
  'badge-ghost': !s,
})

const isRejected = (s) => s?.toUpperCase() === 'REJECTED'

const statusBadgeClass = (s) => ({
  'badge-success': s?.toUpperCase() === 'PASS',
  'badge-error': s?.toUpperCase() === 'FAIL',
  'badge-warning': s?.toUpperCase() === 'WARN',
  'badge-ghost': !s || s?.toUpperCase() === 'INFO',
})

const severityBadgeClass = (s) => ({
  'badge-error': s?.toUpperCase() === 'CRITICAL',
  'badge-warning': s?.toUpperCase() === 'MAJOR',
  'badge-info': s?.toUpperCase() === 'MINOR',
  'badge-success': s?.toUpperCase() === 'PASS',
  'badge-ghost': !s || s?.toUpperCase() === 'INFO',
})

const readinessLabelClass = (label) => ({
  'badge-success': label === 'READY_TO_APPROVE',
  'badge-info': label === 'MINOR_CORRECTIONS_NEEDED',
  'badge-warning': label === 'MAJOR_CORRECTIONS_NEEDED',
  'badge-error': label === 'CRITICAL_ISSUES',
  'badge-ghost': !label,
})
</script>
