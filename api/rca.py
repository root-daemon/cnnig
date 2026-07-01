"""Literature-grounded RCA knowledge base for wafer defect classes."""

from __future__ import annotations

REFERENCES = {
    "P1": {"type": "Primary", "cite": "Emslie, A. G., Bonner, F. T., & Peck, L. G. (1958). Flow of a Viscous Liquid on a Rotating Disk. Journal of Applied Physics, 29(5), 858-862. DOI:10.1063/1.1723300"},
    "P2": {"type": "Primary", "cite": "Meyerhofer, D. (1978). Characteristics of resist films produced by spinning. Journal of Applied Physics, 49(7), 3993-3997. DOI:10.1063/1.325357"},
    "P3": {"type": "Primary", "cite": "Deaton, R., & Massoud, H. Z. (1991). Effect of thermally induced stresses on the rapid-thermal oxidation of silicon. Journal of Applied Physics, 70(7), 3588-3592. DOI:10.1063/1.349254"},
    "P4": {"type": "Primary", "cite": "Wang, X., Lee, H., Nam, S. K., & Kushner, M. J. (2021). Erosion of focus rings in capacitively coupled plasma etching reactors. Journal of Vacuum Science & Technology A, 39(6), 063002. DOI:10.1116/6.0001225"},
    "P5": {"type": "Primary", "cite": "Prasad, Y. N., Kwon, T.-Y., Kim, I.-K., Kim, I.-G., & Park, J.-G. (2011). Generation of Pad Debris during Oxide CMP Process and Its Role in Scratch Formation. Journal of The Electrochemical Society, 158(4), H394-H400. DOI:10.1149/1.3551507"},
    "P6": {"type": "Primary", "cite": "Stapper, C. H. (1973). Defect Density Distribution for LSI Yield Calculations. IEEE Transactions on Electron Devices, ED-20(7), 655-657."},
    "P7": {"type": "Primary", "cite": "Stapper, C. H., Armstrong, F. M., & Saji, K. (1983). Integrated Circuit Yield Statistics. Proceedings of the IEEE, 71(4), 453-470."},
    "P8": {"type": "Primary", "cite": "Mack, C. A. (1988). Understanding Focus Effects in Submicron Optical Lithography. Proc. SPIE 0922, Optical/Laser Microlithography, 135-148. DOI:10.1117/12.968418"},
    "P9": {"type": "Primary", "cite": "Zuo, R., Xu, Q., & Zhang, H. (2007). An inverse-flow showerhead MOVPE reactor design. Journal of Crystal Growth, 298, 425-427. DOI:10.1016/j.jcrysgro.2006.11.044"},
    "S1": {"type": "Textbook", "cite": "May, G. S., & Spanos, C. J. (2006). Fundamentals of Semiconductor Manufacturing and Process Control. Wiley-IEEE Press."},
    "S3": {"type": "Textbook", "cite": "Lieberman, M. A., & Lichtenberg, A. J. (2005). Principles of Plasma Discharges and Materials Processing (2nd ed.). Wiley-Interscience."},
    "S4": {"type": "Monograph", "cite": "Steigerwald, J. M., Murarka, S. P., & Gutmann, R. J. (1997). Chemical Mechanical Planarization of Microelectronic Materials. John Wiley & Sons."},
    "S5": {"type": "Review", "cite": "Zantye, P. B., Kumar, A., & Sikder, A. K. (2004). Chemical mechanical planarization for microelectronics applications. Materials Science and Engineering: R: Reports, 45(3-6), 89-220. DOI:10.1016/j.mser.2004.06.002"},
    "S6": {"type": "Statistical", "cite": "Hansen, M. H., Nair, V. N., & Friedman, D. J. (1997). Monitoring Wafer Map Data from IC Fabrication Processes for Spatially Clustered Defects. Technometrics, 39(3), 241-253. DOI:10.1080/00401706.1997.10485116"},
    "S7": {"type": "Dataset / taxonomy", "cite": "Wu, M.-J., Jang, J.-S. R., & Chen, J.-L. (2015). Wafer Map Failure Pattern Recognition and Similarity Ranking for Large-Scale Data Sets. IEEE Transactions on Semiconductor Manufacturing, 28(1), 1-12. DOI:10.1109/TSM.2014.2364237"},
}

RCA_KB = {
    "Center": {
        "description": "Failing dies concentrated in a compact cluster at the wafer center.",
        "evidence_strength": "Medium-High",
        "evidence": [
            ["Photoresist spin-coat", "Dispense / spread non-uniformity", "Newtonian radial flow on the spinning wafer governs film uniformity.", "Medium-High", "P1", "Primary"],
            ["RTP / Anneal", "Center-to-edge thermal gradient", "Radial temperature gradient during RTP induces center-vs-edge stress / non-uniform reaction.", "Medium-High", "P3", "Primary"],
            ["Deposition (CVD/PVD)", "Center-thick / center-thin film non-uniformity", "Showerhead radial reactant depletion drives center-to-edge thickness variation.", "Medium", "P9", "Primary"],
            ["CMP", "Center over/under-polish", "Carrier-head center-zone pressure sets a radial removal rate.", "Medium", "S4", "Monograph"],
        ],
        "investigations": ["Review spin-coat dispense and spread recipe", "Check chuck backside He cooling / thermal contact", "Verify deposition center-to-edge uniformity", "Review CMP head center-zone pressure"],
        "corrective": ["Adjust spin-coat dispense program", "Restore chuck thermal contact / RTP radial profile", "Tune deposition showerhead / gas loading", "Rebalance CMP zonal pressure"],
    },
    "Donut": {
        "description": "Annular band of failing dies at mid-radius; passing center and passing outer edge.",
        "evidence_strength": "Medium",
        "evidence": [
            ["Photoresist spin-coat", "Radial non-uniformity / solvent-evaporation front", "Evaporation-controlled thinning during spin can leave a mid-radius thickness band.", "Medium-High", "P2", "Primary"],
            ["CMP", "Annular polish non-uniformity", "Retaining-ring / zonal pressure produces an annular removal band.", "Medium-High", "S4", "Monograph"],
            ["Deposition", "Annular film-thickness band", "Radial reactant depletion under the showerhead leaves a mid-radius thickness band.", "Medium", "P9", "Primary"],
            ["Etch", "Radial plasma-etch non-uniformity", "Radial transport gradient in the reactor.", "Low", "S3", "Textbook"],
        ],
        "investigations": ["Review spin-speed profile and bowl exhaust", "Inspect CMP retaining ring and zonal pressure", "Check radial gas/temperature uniformity", "Review bake-plate uniformity"],
        "corrective": ["Adjust spin-speed ramp / evaporation profile", "Replace or retune CMP retaining ring", "Rebalance radial gas/temperature", "Correct bake-plate profile"],
    },
    "Edge-Loc": {
        "description": "Failing dies in a localized arc at the wafer edge.",
        "evidence_strength": "Medium-High",
        "evidence": [
            ["Etch / Plasma", "Localized edge plasma non-uniformity", "Localized focus-ring wear distorts the edge sheath over an arc of the perimeter.", "Medium-High", "P4", "Primary"],
            ["Lithography", "Edge focus / exposure error", "Wafer-edge defocus consumes the depth-of-focus budget at the edge.", "Medium-High", "P8", "Primary"],
            ["Edge handling / clamp", "Edge clamp / contact damage", "Mechanical damage at a clamp or contact point.", "Medium", "S1", "Heuristic"],
            ["Edge-bead removal", "EBR nozzle misalignment", "Mis-set EBR width removes or leaves resist at the wafer edge.", "Medium", "S1", "Heuristic"],
        ],
        "investigations": ["Inspect focus ring for localized wear", "Check edge exposure focus/dose vs depth-of-focus budget", "Inspect wafer clamp pins / contact points", "Verify edge-bead-removal alignment"],
        "corrective": ["Replace or rotate focus ring", "Recalibrate edge exposure / focus offset", "Replace damaged clamp pin", "Realign EBR nozzle"],
    },
    "Edge-Ring": {
        "description": "Failing dies forming a ring around the entire wafer edge.",
        "evidence_strength": "High",
        "evidence": [
            ["Etch / Plasma", "Edge plasma / sheath non-uniformity", "Height/permittivity step at the wafer edge bends the sheath and distorts ion trajectories.", "High", "S3", "Textbook"],
            ["Etch / Plasma", "Focus-ring erosion", "Ion bombardment erodes the consumable focus ring, reintroducing edge non-uniformity over its service life.", "High", "P4", "Primary"],
            ["Etch / Plasma", "Edge gas-distribution effect", "Edge gas flow / chamber edge-purge non-uniformity.", "Medium", "S1", "Textbook"],
            ["RTP / Anneal", "Radial thermal gradient during RTA", "Edge radiative loss creates a radial temperature gradient and edge stress.", "Medium", "P3", "Primary"],
        ],
        "investigations": ["Inspect / replace focus ring", "Verify RF power stability", "Check edge gas-flow uniformity and edge purge", "Review RTA radial temperature profile"],
        "corrective": ["Replace focus ring", "Stabilize RF power delivery", "Rebalance edge gas flow", "Correct RTA radial profile"],
    },
    "Local": {
        "description": "A localized cluster of failing dies on the wafer interior.",
        "evidence_strength": "Medium",
        "evidence": [
            ["Deposition", "Localized deposition anomaly", "Chamber flaking / spit deposits a local particle cluster.", "Medium", "S1", "Heuristic"],
            ["Lithography (reticle)", "Reticle / mask defect", "A reticle particle repeats across all exposure fields; a single local cluster is more often particle/chamber than reticle.", "Low", "S1", "Textbook"],
            ["Handling", "Localized handling contact", "Spatial clusters indicate an assignable tool/step; this is statistical detection, not a specific physical attribution.", "Low", "S6", "Statistical"],
        ],
        "investigations": ["Particle-source / chamber-flaking check", "Reticle / pellicle inspection for repeating-field signature", "Cross-tool commonality analysis"],
        "corrective": ["Perform chamber clean for flaking", "Clean / replace reticle or pellicle", "Remediate handling contact point"],
    },
    "Near-full": {
        "description": "Failing dies cover most of the wafer.",
        "evidence_strength": "Medium",
        "evidence": [
            ["Multiple modules", "Gross process excursion / missed step", "A missed or incorrect process step fails most of the wafer.", "Medium", "S1", "Heuristic"],
            ["Lithography", "Gross dose / focus error", "A whole-wafer recipe error.", "Medium", "S1", "Heuristic"],
            ["Test / Probe", "Probe / contact failure", "Probe-card / contact integrity can create wafer-wide systematic fail maps; rule this out before assigning a process cause.", "Medium", "S6", "Statistical"],
        ],
        "investigations": ["Audit process log for a missed / incorrect step", "Verify recipe vs golden recipe", "Check probe-card / contact integrity", "Gross-defect inspection"],
        "corrective": ["Reprocess / correct the missed step", "Restore golden recipe", "Service probe card", "Contamination remediation"],
    },
    "Random": {
        "description": "Failing dies scattered across the wafer with no coherent spatial structure.",
        "evidence_strength": "Medium-High",
        "evidence": [
            ["Line-wide", "Background killer-defect density", "Random defects follow defect-density / yield statistics.", "High", "P6", "Primary"],
            ["Line-wide", "Defect clustering", "Random defects are not purely Poisson; particle aggregates cluster in negative-binomial statistics.", "Medium-High", "P7", "Primary"],
            ["Line-wide ambient", "Random particulate contamination", "A cleanroom particle excursion deposits scattered killer defects.", "Medium-High", "S1", "Textbook"],
            ["Facilities", "Airborne / chemical contamination", "FFU / filter degradation raises the ambient particle load.", "Medium", "S1", "Heuristic"],
        ],
        "investigations": ["Defect-density monitoring and trend", "Cleanroom particle audit and FFU/filter check", "Chemical / airborne contamination review"],
        "corrective": ["Drive a D0 reduction program", "Replace / service FFU and filters", "Remediate the chemical/airborne source"],
    },
    "Scratch": {
        "description": "Failing dies along a line or curvilinear track.",
        "evidence_strength": "High",
        "evidence": [
            ["CMP", "Mechanical scratch", "Agglomerated slurry particles and conditioning-generated pad debris plough grooves.", "High", "P5", "Primary"],
            ["CMP", "Large / hard abrasive particle", "Oversized or harder particles cut deeper grooves into the surface.", "Medium-High", "S5", "Review"],
            ["Handling / robotics", "Robot end-effector abrasion", "End-effector contact drags across the wafer surface.", "Medium-High", "S1", "Heuristic"],
            ["Handling", "Carrier / cassette scrape", "Contact at a cassette / carrier point.", "Medium", "S1", "Heuristic"],
        ],
        "investigations": ["Inspect CMP pad and slurry filtration", "Check slurry particle-size distribution", "Check robot end-effector and handling path", "Inspect wafer carrier / cassette for contact points"],
        "corrective": ["Recondition / replace CMP pad; improve slurry filtration", "Tighten slurry filtration / large-particle control", "Service / replace end-effector", "Repair cassette contact point"],
    },
}


def get_rca(defect_class: str) -> dict:
    normalized_class = "Local" if defect_class == "Loc" else defect_class
    entry = RCA_KB.get(normalized_class)
    if not entry:
        return {
            "description": "No RCA knowledge base entry is available for this class.",
            "evidence_strength": "N/A",
            "likely_modules": [],
            "investigations": [],
            "corrective": [],
            "evidence": [],
            "references": [],
        }

    likely_modules = list(dict.fromkeys(row[0] for row in entry["evidence"]))
    ref_keys = list(dict.fromkeys(row[4] for row in entry["evidence"]))
    ref_keys.sort(key=lambda k: (k[0] != "P", int(k[1:])))

    return {
        "description": entry["description"],
        "evidence_strength": entry["evidence_strength"],
        "likely_modules": likely_modules,
        "investigations": entry["investigations"],
        "corrective": entry["corrective"],
        "evidence": [
            {
                "process_module": row[0],
                "mechanism": row[1],
                "basis": row[2],
                "strength": row[3],
                "reference_key": row[4],
                "provenance": row[5],
            }
            for row in entry["evidence"]
        ],
        "references": [
            {"key": key, "type": REFERENCES[key]["type"], "cite": REFERENCES[key]["cite"]}
            for key in ref_keys
        ],
    }
