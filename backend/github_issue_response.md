# Github Issue Response

## Issue Description

you wrote

Algorithms Implemented

Hybrid Genetic Search (HGS)
Description: A state-of-the-art genetic algorithm that combines evolutionary operators with local search heuristics. HGS uses population-based search with crossover, mutation, and local improvement operators.
Implementation: Uses the pyVRP library, which provides an efficient HGS implementation.

and according to <https://arxiv.org/pdf/2403.13795> PyVRP really did use HGS in the past - until not long ago.

Your current requirements.txt uses pyvrp==0.6.3 which still did use HGS - so your benchmarks really showed a performant HGS implementation.

Just be aware that because of PyVRP/PyVRP#533 starting with v0.13.0 PyVRP moved from HGS to ILS, see <https://github.com/PyVRP/PyVRP/blob/v0.13.2/docs/source/setup/introduction_to_ils.rst>

PyVRP provides a high-performance implementation of the iterated local search (ILS) algorithm for vehicle routing problems (VRPs). ILS is a single-trajectory algorithm that improves a solution by repeated applications of small perturbations and local improvement procedures. This approach effectively balances between exploration and exploitation of the search space.

Note

For a more thorough introduction to ILS for VRPs, we refer to the works of Lourenço et al. (2019) and Accorsi and Vigo (2021).

(hint: maybe you'd like to add a fifth state-of-the-art algorithm to your benchmarks, PyVRP 0.13.0+ and its ILS 👍 )

Anyhow your benchmarks looked interesting, so I wanted to let you know that.

## My Response

Thank you so much for bringing this to my attention! 🙏 This is really valuable information, and I appreciate you taking the time to share it.

You're absolutely right - when I developed this project, I was using `pyvrp==0.6.3`, which indeed used HGS (Hybrid Genetic Search) at that time. The benchmarks and results in this repository reflect the HGS implementation from that version.

I wasn't aware that PyVRP moved from HGS to ILS (Iterated Local Search) starting with v0.13.0. Thank you for the heads up and for sharing the relevant links:

- [PyVRP/PyVRP#533](https://github.com/PyVRP/PyVRP/issues/533)
- [Introduction to ILS documentation](https://github.com/PyVRP/PyVRP/blob/v0.13.2/docs/source/setup/introduction_to_ils.rst)

## My Plan Going Forward

I'm planning to update this project to address this change:

1. **Keep the current HGS implementation** (pyvrp==0.6.3) as a fallback/reference implementation
2. **Add the new ILS algorithm** using PyVRP v0.13.0+ as a fifth algorithm in the comparison
3. **Update the documentation** to reflect both implementations and their differences
4. **Expand the benchmarks** to compare HGS vs ILS performance

## Future Web Application

I'm also working on converting this project into a **dynamic web application** as a real-world demo project using:

- **React** for the frontend
- **Python (Flask/FastAPI)** for the backend
- **Interactive UI** for:
  - Dataset selection
  - Algorithm parameter tuning
  - Real-time visualization
  - Results comparison

In the web application, I plan to:

- Keep the old HGS implementation (pyvrp==0.6.3) as a fallback option
- Implement the new ILS algorithm (PyVRP v0.13.0+) as the primary/default option
- Allow users to choose between HGS and ILS implementations
- Run everything server-side with results displayed in the browser UI

This will make it easier for users to experiment with different algorithms and see the performance differences in real-time.

## Next Steps

I'll create an issue to track this update and will:

- Update the codebase to support both HGS and ILS
- Add comprehensive documentation about the algorithm change
- Update benchmarks to include ILS results
- Ensure backward compatibility for existing users

Thanks again for the helpful information! This kind of community feedback is what makes open-source projects better. If you have any other suggestions or would like to contribute, feel free to reach out! 🚀

---

**References:**

- [PyVRP Issue #533](https://github.com/PyVRP/PyVRP/issues/533)
- [PyVRP ILS Introduction](https://github.com/PyVRP/PyVRP/blob/v0.13.2/docs/source/setup/introduction_to_ils.rst)
- Lourenço et al. (2019) and Accorsi and Vigo (2021) - ILS for VRPs
