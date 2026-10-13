/**
 * JSDoc mirror of the Laravel ReportPayload JSON contract. The adminclient is
 * plain JavaScript, so these typedefs document the shape consumed by the
 * RenderAgent (they are not enforced at runtime).
 *
 * @typedef {('bar_chart'|'line_chart'|'pie_chart'|'kpi_cards'|'data_table'|'flag_list'|'timeline')} ReportComponent
 *
 * @typedef {Object} RenderInstructions
 * @property {ReportComponent} component
 * @property {?string} [x_axis]
 * @property {?string} [y_axis]
 * @property {?string} [color_by]
 * @property {?number} [highlight_threshold]
 * @property {boolean} [show_law_ref]
 *
 * @typedef {Object} Citation
 * @property {string} law_section
 * @property {string} text
 * @property {boolean} relevant
 *
 * @typedef {Object} ReportSection
 * @property {string} id
 * @property {string} title
 * @property {number} order
 * @property {RenderInstructions} render_instructions
 * @property {Object.<string, *>[]} data
 * @property {string} narrative
 * @property {Citation[]} citations
 *
 * @typedef {Object} ReportMetadata
 * @property {string} generated_at
 * @property {{from: ?string, to: ?string}} period
 * @property {?number} entity_id
 * @property {?string} entity_name
 * @property {string} generated_by_model
 *
 * @typedef {Object} ReportPayload
 * @property {string} report_id
 * @property {string} report_type
 * @property {ReportMetadata} metadata
 * @property {ReportSection[]} sections
 * @property {string} summary_narrative
 */

export const REPORT_COMPONENTS = [
  'bar_chart',
  'line_chart',
  'pie_chart',
  'kpi_cards',
  'data_table',
  'flag_list',
  'timeline',
]
